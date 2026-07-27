'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Input,
  PinInput,
  Portal,
  RadioGroup,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuMail, LuMessageSquare } from 'react-icons/lu';
import {
  getSignInOptions,
  sendMagicLink,
  sendSmsCode,
  verifySmsCode,
} from './actions';
import type { SignInOptions, ChannelQuota } from '@/lib/auth/quota';

const ERRORS: Record<string, string> = {
  unauthorized: 'That account is not allowed to edit this site.',
  invalid_link: 'That link has expired or was already used. Request a new one.',
  missing_code: 'Something went wrong with the sign-in link. Try again.',
};

type Step = 'email' | 'choose' | 'sent' | 'code';

/** How long before a code can be re-sent. Guards the SMS quota. */
const RESEND_COOLDOWN_SECONDS = 60;

/** "in 42 minutes" / "shortly" - used when a channel is exhausted. */
function resetHint(quota: ChannelQuota): string {
  if (!quota.resetsAt) return '';
  const mins = Math.ceil((new Date(quota.resetsAt).getTime() - Date.now()) / 60_000);
  if (mins <= 1) return 'frees up in about a minute';
  if (mins < 60) return `frees up in about ${mins} minutes`;
  return 'frees up within the hour';
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/admin';

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [options, setOptions] = useState<SignInOptions | null>(null);
  const [choice, setChoice] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  /** Seconds until "Resend code" becomes clickable again. */
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(
    ERRORS[searchParams.get('error') ?? ''] ?? null
  );

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const emailExhausted = (options?.emailQuota.remaining ?? 1) === 0;
  const smsUnavailable =
    !options?.smsQuota.available || options.smsQuota.remaining === 0;

  /**
   * A server action can still reject unexpectedly (a network drop, a redeploy
   * mid-request). Without this the button would spin forever and the thrown
   * value would surface as an empty "{}" - the exact failure this rework
   * targets. Every handler funnels its action through here so a rejection
   * always clears loading and shows a real message.
   */
  const FALLBACK_ERROR = 'Something went wrong. Please try again.';

  /** Step 1 - look up what this address can use, then open the chooser. */
  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await getSignInOptions(email.trim());
      setOptions(result);
      // Pre-select whichever channel is actually usable.
      setChoice(
        result.emailQuota.remaining > 0 || !result.smsQuota.available ? 'email' : 'sms'
      );
      setStep('choose');
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  /** Step 2 - send by the chosen channel. */
  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        choice === 'email'
          ? await sendMagicLink(email.trim(), window.location.origin)
          : await sendSmsCode(email.trim());

      if (!result.ok) {
        setError(result.error ?? 'Could not send. Try the other option.');
        return;
      }
      if (choice === 'sms') setResendIn(RESEND_COOLDOWN_SECONDS);
      setStep(choice === 'email' ? 'sent' : 'code');
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  /** Sends another code. Rate limited client-side by the cooldown, and
      server-side by the same quota check as the first send. */
  const handleResend = async () => {
    setLoading(true);
    setError(null);
    setResent(false);

    try {
      const result = await sendSmsCode(email.trim());
      if (!result.ok) {
        setError(result.error ?? 'Could not resend the code.');
        return;
      }
      setCode([]);
      setResent(true);
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  /** Returns to the channel chooser - the way out if a code or link never
      arrives, without losing the address already typed. */
  const backToChoice = () => {
    setCode([]);
    setError(null);
    setResent(false);
    setStep('choose');
  };

  /** Step 3 (SMS only) - verify the code and go. */
  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await verifySmsCode(email.trim(), code.join(''));
      if (!result.ok) {
        setError(result.error ?? 'That code is not valid.');
        setLoading(false);
        return;
      }
      // Success: navigate. Loading stays on through the transition so the
      // button cannot be clicked twice while the new page loads.
      router.push(next);
      router.refresh();
    } catch {
      setError(FALLBACK_ERROR);
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" px="6" bg="bg.primary">
      <Box
        w="full"
        maxW="440px"
        bg="bg.surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="lg"
        p={{ base: '8', md: '10' }}
      >
        <VStack align="start" gap="6">
          <VStack align="start" gap="2">
            <Text as="h1" textStyle="h3" color="text.primary">
              Edit your site
            </Text>
            <Text textStyle="caption" color="text.tertiary">
              {step === 'code'
                ? 'Enter the 6-digit code we texted you.'
                : "Sign in with a one-time link or code. There's no password."}
            </Text>
          </VStack>

          {/* ---------------------------------------------------- step: email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
              <VStack align="stretch" gap="4">
                <Box>
                  <Text
                    asChild
                    display="block"
                    textStyle="captionBold"
                    color="text.primary"
                    mb="2"
                  >
                    <label htmlFor="email">Email address</label>
                  </Text>
                  <Input
                    id="email"
                    data-testid="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderColor="border.default"
                    borderRadius="base"
                  />
                </Box>

                {error && (
                  <Text textStyle="caption" color="status.error">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  data-testid="login-continue"
                  variant="solid"
                  borderRadius="button"
                  loading={loading}
                  w="full"
                >
                  Continue
                </Button>
              </VStack>
            </form>
          )}

          {/* ----------------------------------------------------- step: sent */}
          {step === 'sent' && (
            <Box
              w="full"
              p="4"
              borderRadius="md"
              bg="bg.secondary"
              borderLeft="3px solid"
              borderLeftColor="accent.brand"
            >
              <Text textStyle="bodyBold" color="text.primary" mb="1">
                Check your inbox
              </Text>
              <Text textStyle="caption" color="text.tertiary">
                If {email} can edit this site, a sign-in link is on its way. The
                link expires in one hour.
              </Text>

              <Button
                data-testid="login-back-email"
                variant="outline"
                borderRadius="button"
                size="sm"
                mt="4"
                onClick={backToChoice}
              >
                Use a different method
              </Button>
            </Box>
          )}

          {/* ----------------------------------------------------- step: code */}
          {step === 'code' && (
            <VStack align="stretch" gap="4" w="full">
              <PinInput.Root
                value={code}
                onValueChange={(e) => setCode(e.value)}
                otp
                count={6}
                colorPalette="brand"
              >
                <PinInput.HiddenInput />
                <PinInput.Control data-testid="login-code">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <PinInput.Input key={i} index={i} />
                  ))}
                </PinInput.Control>
              </PinInput.Root>

              {error && (
                <Text textStyle="caption" color="status.error">
                  {error}
                </Text>
              )}

              <Button
                data-testid="login-verify"
                variant="solid"
                borderRadius="button"
                loading={loading}
                disabled={code.join('').length < 6}
                onClick={handleVerify}
                w="full"
              >
                Sign in
              </Button>

              <Flex align="center" justify="center" gap="2" pt="1">
                <Text textStyle="caption" color="text.tertiary">
                  Didn&apos;t get it?
                </Text>
                <Button
                  data-testid="login-resend"
                  variant="plain"
                  size="sm"
                  height="auto"
                  padding="0"
                  color="accent.brand"
                  textStyle="caption"
                  cursor={resendIn > 0 ? 'not-allowed' : 'pointer'}
                  disabled={resendIn > 0 || loading}
                  onClick={handleResend}
                >
                  {resendIn > 0
                    ? `Resend in ${Math.floor(resendIn / 60)}:${String(resendIn % 60).padStart(2, '0')}`
                    : 'Resend code'}
                </Button>
              </Flex>

              {resent && (
                <Text textStyle="caption" color="status.success" textAlign="center">
                  A new code is on its way.
                </Text>
              )}

              <Button
                data-testid="login-back"
                variant="outline"
                borderRadius="button"
                onClick={backToChoice}
                w="full"
              >
                Use a different method
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* ------------------------------------------------- modal: pick channel */}
      <Dialog.Root
        open={step === 'choose'}
        onOpenChange={(e) => !e.open && setStep('email')}
        size="sm"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content data-testid="login-choice">
              <Dialog.Header>
                <Dialog.Title textStyle="label">How should we reach you?</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                <RadioGroup.Root
                  value={choice}
                  onValueChange={(e) => setChoice(e.value as 'email' | 'sms')}
                  colorPalette="brand"
                >
                  <VStack align="stretch" gap="3">
                    <ChannelOption
                      value="email"
                      icon={<LuMail />}
                      title="Email me a sign-in link"
                      detail={email}
                      disabled={emailExhausted}
                      disabledNote={
                        options
                          ? `Email limit reached (${options.emailQuota.max}/hour) - ${resetHint(options.emailQuota)}`
                          : undefined
                      }
                    />
                    <ChannelOption
                      value="sms"
                      icon={<LuMessageSquare />}
                      title="Text me a code"
                      detail={options?.maskedPhone ?? undefined}
                      disabled={smsUnavailable}
                      disabledNote={
                        options?.smsQuota.available === false
                          ? options.smsQuota.reason
                          : options
                            ? `Text limit reached - ${resetHint(options.smsQuota)}`
                            : undefined
                      }
                    />
                  </VStack>
                </RadioGroup.Root>

                {error && (
                  <Text textStyle="caption" color="status.error" mt="4">
                    {error}
                  </Text>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  variant="outline"
                  borderRadius="button"
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
                <Button
                  data-testid="login-send"
                  variant="solid"
                  borderRadius="button"
                  loading={loading}
                  disabled={choice === 'email' ? emailExhausted : smsUnavailable}
                  onClick={handleSend}
                >
                  Send
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Flex>
  );
}

/** One radio row, greyed out with a reason when its quota is spent. */
function ChannelOption({
  value,
  icon,
  title,
  detail,
  disabled,
  disabledNote,
}: {
  value: string;
  icon: React.ReactNode;
  title: string;
  detail?: string;
  disabled?: boolean;
  disabledNote?: string;
}) {
  return (
    <RadioGroup.Item
      value={value}
      disabled={disabled}
      data-testid={`login-option-${value}`}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      p="4"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.55 : 1}
    >
      <RadioGroup.ItemHiddenInput />
      <RadioGroup.ItemIndicator />
      <RadioGroup.ItemText>
        <Flex align="center" gap="2" color="text.primary">
          {icon}
          <Text textStyle="captionBold">{title}</Text>
        </Flex>
        {detail && (
          <Text textStyle="caption" color="text.tertiary" mt="1">
            {detail}
          </Text>
        )}
        {disabled && disabledNote && (
          <Text textStyle="caption" color="status.error" mt="1">
            {disabledNote}
          </Text>
        )}
      </RadioGroup.ItemText>
    </RadioGroup.Item>
  );
}

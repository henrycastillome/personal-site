import { Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import FullScreenSection from "../components/FullScreenSection";
import ScrollReveal from "../hooks/ScrollReveal";
import { useAlertContext } from "../context/alertContext";

const GoingForward = ({
  title,

  type,
  type2,
  description2,

  backgroundColor,
  description,
}) => {
  const {  colorMode } = useAlertContext();
  return (
    <FullScreenSection
      backgroundColor={backgroundColor}
      alignItems={"center"}
      color={colorMode==='light'? "dark":'light'}
      spacing={8}
      width="100vw"
      p={{ base: 8, md: 32 }}
    >
      <VStack alignItems={"center"} justifyContent={"center"} width={{base:'80vw', md:'60vw'}}>
        <ScrollReveal>
          <Heading
            as="h2"
            fontSize={{base:"4xl", md:"6xl"}}
            paddingBottom={12}
            textAlign={"center"}
          >
            {title}
          </Heading>
        </ScrollReveal>
        <ScrollReveal>
          <Text
            align={'center'}
            fontSize={{base:"2xl", md:"4xl"}}
            textStyle="h6"
            textColor={colorMode==='light'?'blue':'blueDarkMode'}
            paddingBottom={4}
          >
            {type}
          </Text>
        </ScrollReveal>

        <ScrollReveal>
          <Text
            fontSize={{base:"lg", md:"2xl"}}
            textStyle="body"
            textColor={colorMode==='light'? "dark":'light'}
            textAlign={"center"}
            paddingBottom={8}
          >
            {description}
          </Text>
        </ScrollReveal>

        <ScrollReveal>
          <Text
            as="b"
            fontSize={{base:"2xl", md:"4xl"}}
            textStyle="h6"
            textColor={colorMode==='light'?'blue':'blueDarkMode'}
            paddingBottom={4}
          >
            {type2}
          </Text>
        </ScrollReveal>

        <ScrollReveal>
          <Text
            fontSize={{base:"lg", md:"2xl"}}
            textStyle="body"
            textColor={colorMode==='light'? "dark":'light'}
            textAlign={"center"}
            paddingBottom={8}
          >
            {description2}
          </Text>
        </ScrollReveal>
      </VStack>
    </FullScreenSection>
  );
};

export default GoingForward;

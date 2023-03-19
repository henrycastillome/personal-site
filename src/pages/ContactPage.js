import React from "react";
import FullScreenSection from "../components/FullScreenSection";
import { Heading, VStack, Text } from "@chakra-ui/react";
import Header from "../components/Header";
import ContactMeSection from "../components/ContactMeSection";
import Footer from "../components/Footer";
import Alert from "../components/Alert";


function ContactPage () {
  return (
    <main>
      <Header/>
      <FullScreenSection
        backgroundColor="light"
        alignContent="center"
        alignItems='center'
        spacing={8}
        width="100vw"
        pt={48}
        pl={{ base: 8, md: 32 }}
        pb={32}
        pr={{ base: 8, md: 32 }}
      >
        <VStack alignItems="start" justifyContent="left">
          <Heading
            color="dark"
            size={{ base: "3xl", md: "4xl" }}
            textStyle="h2"
          >
            Contact Me
          </Heading>
        </VStack>
      </FullScreenSection>
      <FullScreenSection
        backgroundColor="dark"
        isDarkBackground
        alignItems={"center"}
        spacing={8}
        width="100vw"
        p={{ base: 8, md: 32 }}
      >
         <VStack alignItems={"center"} justifyContent={"center"}>
          <Text textStyle="body" fontSize={"xl"} align={"center"}>
          Get in touch with me to discuss your project and see how we can work together. 
          Fill out the contact form or send me an email at <a href="mailto:hcasti40@pratt.edu" style={{ color: "#007183" }}>hcasti40@pratt.edu </a> 
          and I'll get back to you as soon as possible.
          </Text>
          </VStack>

      </FullScreenSection>
      <ContactMeSection />
     
      <Footer />
      <Alert />
    </main>
  );
}

export default ContactPage;

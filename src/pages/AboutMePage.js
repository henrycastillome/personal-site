import React, {useState, useEffect} from "react";
import FullScreenSection from "../components/FullScreenSection";
import { Heading, VStack } from "@chakra-ui/react";
import Header from "../components/Header";
import AboutMeSection from "../components/AboutMeSection";
import Footer from "../components/Footer";
import { useAlertContext } from "../context/alertContext";
import Loader from "../components/Loader";

const aboutMe = "About Me";

function AboutMePage () {
  const {  colorMode, } = useAlertContext();
  const [isLoading, setIsLoading]=useState(true)
  useEffect(()=>{
    setTimeout(()=>{
      setIsLoading(false);
    }, 1500)
  }, []);
  
  return (
    <main>
       {isLoading ? (
        <Loader />
      ) : (
        <>
      <Header/>
      <FullScreenSection
        backgroundColor={colorMode==='light'? "light":'dark'}
        alignContent="center"
        alignItems={{ base: "center", md: "center", xl: "center" }}
        spacing={8}
        width="100vw"
        pt={48}
        pl={{ base: 8, md: 32 }}
        pb={32}
        pr={{ base: 8, md: 32 }}
      >
        <VStack alignItems="start" justifyContent="left">
          <Heading
            color={colorMode==='light'? "dark":'light'}
            size={{ base: "3xl", md: "4xl" }}
            textStyle="h2"
          >
            {aboutMe}
          </Heading>
        </VStack>
      </FullScreenSection>
      <AboutMeSection />
      <Footer />
      </>
      )}
    </main>
  );
}

export default AboutMePage;

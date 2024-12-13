import * as React from "react";
import { VStack } from "@chakra-ui/react";


const FullScreenSection = ({ 
  children, 
  isCentered = false, 
  isDarkBackground = false,
  isBlackBackground =false,
  isLanding = false, 
  ...boxProps 
}) => {
  return (
    <VStack
      backgroundColor={isDarkBackground ? "semantic.background.secondary" : isBlackBackground ? "semantic.background.button" : "semantic.background.primary"}
      alignItems={isCentered ? "center" : "start"}
      justifyContent={isCentered ? "center" : "flex-start"}
      textAlign={isCentered ? "center" : "start"}
      spacing={8}
      width="100vw"
      height= {isLanding ? "75vh" : "auto"}
      pt={{base:48,md:'15vh'}}
      pl={{ base: 8, md: 32 }}
      pb={32}
      pr={{ base: 8, md: 32 }}
      {...boxProps}
    >
      <VStack  >
        {children}
      </VStack>
    </VStack>
  );
};

export default FullScreenSection;

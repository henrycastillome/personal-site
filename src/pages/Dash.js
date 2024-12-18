import React, {useState, useEffect} from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
// import LandingImage from "../layout/LandingImage";
// import ProjectTitle from "../layout/ProjectTitle";
// import ButtonsBottom from "../layout/ButtonsBottom";
import Loader from "../components/Loader";
import { useAlertContext } from "../context/alertContext";
// import { dashData } from "../utils/projectsContent/dashData";
// import ProjectOverviewProgamming from "../layout/ProjectOverviewProgramming";
// import StartingDesign from "../layout/StartingDesign";
import FullScreenSection from "../components/FullScreenSection";
import FunnyLoader from "../components/FunnyLoader";

const Dash = () => {
  const { colorMode} = useAlertContext();
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
          <Header />
          <FullScreenSection
      backgroundColor={colorMode==='light'? "light":'dark'}
      alignContent="center"
      alignItems='center'
      spacing={8}
      width="100vw"
      pt={48}
      pl={{ base: 8, md: 32 }}
      pb={32}
      pr={{ base: 8, md: 32 }}
      >
        <FunnyLoader />
        
      </FullScreenSection>
          {/* {dashData.map((project, index) => (
            <React.Fragment key={index}>
              <LandingImage
                imageSrc={project.landingImage}
                alt="mockup react project"
              />

              <ProjectTitle
                client={project.client}
                title={project.projectTitle.title}
                role={project.projectTitle.role}
                tools={project.projectTitle.tools}
                dateInititial={project.projectTitle.dateInitial}
                dateFinal={project.projectTitle.dateFinal}
              />
              <ProjectOverviewProgamming
                backgroundColor={
                  colorMode === "light" ? "secondLight" : "darkDarkMode"
                }
                description={project.projectOverview.description}
                challenge={project.projectOverview.challenge}
                features={project.projectOverview.features}
              />

              <StartingDesign
                backgroundColor={colorMode === "light" ? "light" : "dark"}
                subtitle="Code Snippets"
                designData={project.designData}
              />
              <ButtonsBottom
                hasLinkToOtherPages
                backgroundColor={
                   colorMode === "light" ? "light" : "dark"
                }
                button1="Launch Project"
                button2="View Github"
                href1={project.links.live}
                href2={project.links.github}
              /> */}
              <Footer />
            {/* </React.Fragment> */}
          {/* ))} */}
        </>
      )}

     
    </main>
  );
};

export default Dash;

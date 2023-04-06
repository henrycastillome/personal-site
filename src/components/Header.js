import React, { useEffect, useState } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import logoHenry from "../images/hc_logos_black.png";
import CustomizedButton from "./CustomizedButton";
import { useAlertContext } from "../context/alertContext";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SmallScreen from "./SmallScreen";
import { useScrollLock } from "../hooks/useScrollLock";
import { Link } from "react-router-dom";
import "animate.css";

const logo = [
  {
    id: "henryLogo",
    src: logoHenry,
    alt: "henryLogo",
  },
];

const Logo = ({ id, src, alt }) => (
  <img style={{ width: "82px", height: "82px" }} key={id} src={src} alt={alt} />
);

const Header = ({ isHomePage }) => {
  const { handleClick } = useAlertContext();

  const [previousScroll, setPreviousScroll] = useState(0);
  const [showMenu, setShowMenu] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { lockScroll, unlockScroll } = useScrollLock();
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);

    lockScroll();
  };

  useEffect(() => {
    if (!isOpen) {
      unlockScroll();
    }
  }, [isOpen, unlockScroll]); //This will call the unlockScroll function whenever the isOpen state variable changes and its value is false, which means the menu is closed.

  useEffect(() => {
    function handleScroll() {
      setIsOpen(false);
      const currentScroll = window.scrollY;
      if (typeof window !== "undefined") {
        if (currentScroll > previousScroll) {
          setShowMenu(false);
        } else {
          setShowMenu(true);
          if(!hasAnimated){
            setHasAnimated(true)
          }
        }
      }

      setPreviousScroll(window.scrollY);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [previousScroll, hasAnimated]);

  

  return (
    <>
      {showMenu && (
        <Box
          position="fixed"
          top={0}
          translateY={0}
          transitionProperty="transform"
          transitionDuration="0.3s"
          transitionTimingFunction="ease-in-out"
          zIndex="overlay"
          alignItems="flex-start"
          width="100vw"
          boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
        >
          <Box color="dark" w="100%" textStyle="body" backgroundColor="light">
            <HStack
              px={10}
              py={4}
              justifyContent="space-between"
              alignItems="center"
            >
              <nav>
                <HStack >
                  {logo.map(
                    (
                      logos // rendering the list of icons using .map () method
                    ) => (
                      <a className={hasAnimated? "": "heading-animation-down"}  key={logos.id} href="/" rel="noopener noreferrer">
                        <Logo key={logos.id} src={logos.src} alt={logos.alt} />
                      </a>
                    )
                  )}
                </HStack>
              </nav>
              <nav>
                {isHomePage ? (
                  <HStack spacing={8} display={{ base: "none", md: "flex" }}>
                    <Link to="/">
                      <button className={hasAnimated? "":'heading-animation-two-down'} >Home</button>
                    </Link>

                    {<button className={hasAnimated? "":"heading-animation-three-down"} onClick={handleClick("aboutme")}>About</button>}
                    {<button className={hasAnimated? "":"heading-animation-four-down"} onClick={handleClick("projects")}>Work</button>}
                    {
                      <button className={hasAnimated? "":"heading-animation-five-down"} onClick={handleClick("contactme")}>
                        {" "}
                        Contact
                      </button>
                    }
                    {
                      <a
                        href={require("../documents/ResumeHenry.pdf")}
                        rel="noreferrer"
                        target="_blank"
                        className={hasAnimated? "":"heading-animation-six-down"}
                      >
                        {" "}
                        <CustomizedButton>RESUME</CustomizedButton>{" "}
                      </a>
                    }
                  </HStack>
                ) : (
                  <HStack spacing={8} display={{ base: "none", md: "flex" }}>
                    <Link to="/">
                      <button >Home</button>
                    </Link>

                    {
                      <Link to="/aboutme">
                        {" "}
                        <button >About</button>
                      </Link>
                    }
                    {
                      <Link to="/projects">
                        <button >Work</button>
                      </Link>
                    }
                    {
                      <Link to="/contactme">
                        <button > Contact</button>
                      </Link>
                    }
                    {
                      <a
                        href={require("../documents/ResumeHenry.pdf")}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {" "}
                        <CustomizedButton>RESUME</CustomizedButton>{" "}
                      </a>
                    }
                  </HStack>
                )}
                <VStack
                  spacing={8}
                  display={{ base: "flex", md: "none" }}
                  color={!isOpen ? "dark" : "light"}
                >
                  <button onClick={handleToggle} style={{ zIndex: "100000" }}>
                    {" "}
                    {isOpen ? (
                      <FontAwesomeIcon icon={faTimes} size="2xl" />
                    ) : (
                      <FontAwesomeIcon icon={faBars} size="2xl" id="icon" />
                    )}{" "}
                  </button>
                  {isHomePage ? (
                    <SmallScreen
                      className={`${
                        isOpen ? "removeTransition" : "addTransiton"
                      }`}
                      isHomePage
                    />
                  ) : (
                    <SmallScreen
                      className={`${
                        isOpen ? "removeTransition" : "addTransiton"
                      }`}
                    />
                  )}
                </VStack>
              </nav>
            </HStack>
          </Box>
        </Box>
      )}
    </>
  );
};
export default Header;

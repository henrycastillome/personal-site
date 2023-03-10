import { Box, HStack, VStack } from "@chakra-ui/react";
import CustomizedButton from "./CustomizedButton"
import { useAlertContext } from "../context/alertContext"
import { Link } from 'react-router-dom';
import React from "react";


const SmallScreen = ({className,children, isHomePage}) => {
    const { handleClick, handleClickToTop } = useAlertContext();
    return (

        <Box
            height='100vh'
            width="400px"
            position='absolute'
            zIndex='0'
            right='0'
            top='-32px'
            backgroundColor='dark'
            display={{ base: 'flex', md: "none" }}
            alignItems='top'
            className={className}


        >
            <Box color='light' margin="0 auto" textStyle="body" mt='7em'>
                <HStack
                    px={10}
                    py={10}

                >

                    <VStack spacing={8} >
                        <nav>


                            <Box display='absolute' justifyContent='center' alignItems='center'>
                                {isHomePage ? 
                                <VStack spacing={20} >
                                    {(<Link to="/"><button onClick={handleClickToTop}>Home</button></Link>)}


                                    {(<button onClick={handleClick('aboutme')}>About</button>)}

                                    {(<button onClick={handleClick('projects')}>Work</button>)}

                                    {(<button onClick={handleClick('contactme')}> Contact</button>)}

                                    {(<a href={require('../documents/resumeHenry.pdf')} rel="noreferrer" target="_blank"> <CustomizedButton>RESUME</CustomizedButton> </a>)}
                                </VStack>
                                :
                                <VStack spacing={20} >
                                    {(<Link to="/"><button onClick={handleClickToTop}>Home</button></Link>)}


                                    {<Link to="/aboutme"> <button onClick={handleClickToTop}>About</button></Link>}

                                    {<Link to="/projects"><button onClick={handleClickToTop}>Work</button></Link>}

                                    {<Link to="/contactme"><button onClick={handleClickToTop}> Contact</button></Link>}

                                    {(<a href={require('../documents/resumeHenry.pdf')} rel="noreferrer" target="_blank"> <CustomizedButton>RESUME</CustomizedButton> </a>)}
                                </VStack>}
                            </Box>
                        </nav>
                    </VStack>
                </HStack>
            </Box>
            {children}

        </Box>



    )
}


export default SmallScreen
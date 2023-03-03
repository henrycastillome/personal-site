
import {
  Image, Box, Heading, VStack, Text, HStack,
  Card, CardHeader, CardBody, CardFooter, Divider
} from '@chakra-ui/react'
import Header from "../components/Header"
import FullScreenSection from "../components/FullScreenSection";


const CaseStudyArchives = () => {
  const projectInfo = [
    {
      title: "Enhancing User Experience for Better Donations on Support Page",
      client: "ARCHIVES OF AMERICAN ART",
      getImageSrc: () => require("../images/AAlaptop-noBG.png"),
      role: "UX researcher, user testing, UI designer",
      tools: "Figma, Zoom, MiroBoard",
      date: "Oct-Dec 2022"
    }
  ];
  const projectOverview = [
    {
      title: 'Project Overview',
      challenge: `Redesign the Archives of American Art support page to increase overall donations. 
                        Donations are critical to support the Archives' goal of collecting, preserving, 
                        and providing access to primary sources that document the history of the visual arts`,
      solution: `Create a more friendly user interface (UI) by reorganizing the visual hierarchy of the content,
                        creating more prominent and interactive buttons, and adding personal touches to the page`
    }
  ]

  const currentState = [
    {
      title: "Current State",
      description: "Support Page",
      description2: "Support/other-ways-to-give",
      getImageSrc: () => require("../images/currentstate1.png"),
      getImageSrc2: () => require("../images/currentstate2.png")
    }
  ]

  const research=[{
    title:"Research",
    subtitle: `Understand the user target:`,
    description: `I started the project by researching the characteristics of users most likely to make a donation.
                   We used a study published by give.org that measured donor beliefs, feelings, and behavioral intentions 
                   toward charitable giving to help develop our user profile. By analyzing the study, I focused on generations 
                   with a higher rate of giving to Art and Culture charities, taking into account their education 
                   level and employment status as well.`,
    subtitle2:`Create user profile`,
    description2: `In the end, I created a user profile which was referenced to recruit the participants for usability testing.
                   Key points for user profile:
                   `,
    description3:[
      {
        subtitle: '• Three generations',
        millenials: `- Millenials (Age 25-41)`,
        generationX: `- Generation X (Age 42-57)`,
        boomers: `- Boomers (Age 58-76)`

      }
    ],
    description4:[
      {
        subtitle: '• Interests',
        interests: `Art, culture and museums`

      }
    ],
    description5:[
      {
        subtitle: '• Preferable ocupations',
        art: `- Art enthusiast`,
        collector: `- Collector`,
        designer:`- Designer`,
        museumgoer:`- Museum goer`,
        historyresearcher: `-History researcher`,

      }
    ]
  }]

  const usertesting=[{
    title: `User Testing`,
    subtitle: `Moderate remote & in-person:`,
    description:`To evaluate the usability of the existing Archive of American Art support page I conducted asynchronous 
                sessions with each participant. All participants were guided through three tasks and scenarios in which they 
                were prompted to think aloud. The team asked follow-up questions as needed to provide clarification `,
    getImageSrc: () => require("../images/usertesting.png"),
    imagedescription:`Remote testing`,
    task1:[{
      tasknumber: '• Task 1',
      description:` Imagine that you want to  to support The Smithsonian Archives of American Art for its future growth and current mission. 
                    Please go to the support page (https://www.aaa.si.edu/support) and find different ways of donating and specifically find 
                    the IRA Rollover way of donation.`,
      tasknumber2: '• Task 2',
      description2:` You are making a gift to Archives of American Art for research in honor of Kevin Baker. 
                    Find how to make a 75 dollar donation and get to the billing page`,
      tasknumber3: '• Task 3',
      description3:` You are a representative of an international company and your company wants to donate money to the Archives of American Art. 
                    Find information on how your company can do that`,

    }],
    followup:[
      {
        description:`• Follow-up questions:`,
        question1: `- On a scale of 1-5 (1: very easy and 5: very difficult) , how would you rate your experience completing the task? Why do you choose this scale?`,
        question2: `- Why did you choose this rating? `,
        question3:  `- Would you want to add or remove any information from this page?`
      }
    ]

  }]









  return (
    <main>
      <Header />
      {/*image */}
      <FullScreenSection
        backgroundColor="light"

        alignItems={"center"}
        spacing={8}
        width='100vw'
        pt={48}
        pl={32}
        pb={32}
        pr={32}


      >
        <Box >
          <Image src={projectInfo[0].getImageSrc()} alt="laptop" background="none" />
        </Box>
      </FullScreenSection>

      {/*Title */}

      <FullScreenSection
        backgroundColor="dark"
        isDarkBackground
        alignItems={"center"}
        spacing={8}
        width='100vw'
        p={32}>
        <VStack alignItems={'center'} justifyContent={'center'}>
          <Text textStyle='h2' fontSize={'4xl'}> {projectInfo[0].client}</Text>
          <Text textStyle='body' fontSize={'2xl'} textAlign={'center'}> {projectInfo[0].title}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>Role:</b></span> {projectInfo[0].role}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>Tools:</b></span> {projectInfo[0].tools}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>Date: </b></span>{projectInfo[0].date}</Text>
        </VStack>


      </FullScreenSection>

      {/*Project Overview section */}
      <FullScreenSection
        backgroundColor="secondLight"

        alignItems={"center"}
        spacing={8}
        width='100vw'
        p={32}>
        <VStack alignItems={'flex start'} justifyContent={'center'}>
          <Text textStyle='h2' fontSize={'4xl'}> {projectOverview[0].title}</Text>

          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>Challenge:</b></span> {projectOverview[0].challenge}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>Solution:</b></span> {projectOverview[0].solution}</Text>
        </VStack>

      </FullScreenSection>

      {/*current state */}

      <FullScreenSection
        backgroundColor="light"

        alignItems={"center"}
        spacing={8}
        width='100vw'
        p={32}>
        <VStack alignItems={'flex start'} justifyContent={'center'}>
          <Text textStyle='h2' fontSize={'4xl'}> {currentState[0].title}</Text>
          <HStack>
            <Card boxShadow='xl' >

              <CardBody><Image src={currentState[0].getImageSrc()} alt="mockup lato" background='none' borderRadius='lg' /> </CardBody>

              <CardFooter justify={'center'}>
                <Text fontSize='lg' textStyle='body'> <span style={{ color: '#007183' }}><b>{currentState[0].description}</b></span>
                </Text> </CardFooter>
            </Card>
            <Card boxShadow='xl'>

              <CardBody><Image src={currentState[0].getImageSrc2()} alt="mockup lato" background='none' borderRadius='lg' /> </CardBody>

              <CardFooter justify={'center'}>
                <Text fontSize='lg' textStyle='body'> <span style={{ color: '#007183' }}><b>{currentState[0].description2}</b></span>
                </Text> </CardFooter>
            </Card>


          </HStack>
        </VStack>

      </FullScreenSection>

      {/*Research */}

      <FullScreenSection
        backgroundColor="secondLight"

        alignItems={"center"}
        spacing={8}
        width='100vw'
        pt={16}
        pl={32}
        pb={8}
        pr={16}>

          <VStack alignItems={'flex start'} justifyContent={'center'}>
          <Text textStyle='h2' fontSize={'4xl'}> {research[0].title}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>{research[0].subtitle}</b></span> {research[0].description}  </Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>{research[0].subtitle2}</b></span> {research[0].description2}</Text>
          <Text size='sm' textStyle='body' pl={8}>  <b>{research[0].description3[0].subtitle}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description3[0].millenials}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description3[0].generationX}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description3[0].boomers}</Text>

          <Text size='sm' textStyle='body' pl={8}>  <b>{research[0].description4[0].subtitle}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description4[0].interests}</Text>

          <Text size='sm' textStyle='body' pl={8}>  <b>{research[0].description5[0].subtitle}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description5[0].art}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description5[0].collector}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description5[0].designer}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description5[0].museumgoer}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {research[0].description5[0].historyresearcher}</Text>
          </VStack>


        </FullScreenSection>



      {/*User testing */}

      <FullScreenSection
        backgroundColor="light"

        alignItems={"center"}
        spacing={8}
        width='100vw'
        pt={16}
        pl={32}
        pb={8}
        pr={16}>

          <VStack alignItems={'flex start'} justifyContent={'center'}>
          <Text textStyle='h2' fontSize={'4xl'}> {usertesting[0].title}</Text>
          <Text size='sm' textStyle='body'> <span style={{ color: '#007183' }}><b>{usertesting[0].subtitle}</b></span> {usertesting[0].description}  </Text>

          <Card boxShadow='xl' >

              <CardBody><Image src={usertesting[0].getImageSrc()} alt="usertesting on Zoom" background='none' borderRadius='lg' /> </CardBody>

              <CardFooter justify={'center'}>
                <Text fontSize='lg' textStyle='body'> <span style={{ color: '#007183' }}><b>{usertesting[0].imagedescription}</b></span>
                </Text> </CardFooter>
            </Card>
           
          
          <Text size='sm' textStyle='body' pl={8}>  <b>{usertesting[0].task1[0].tasknumber}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].task1[0].description}</Text>

          <Text size='sm' textStyle='body' pl={8}>  <b>{usertesting[0].task1[0].tasknumber2}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].task1[0].description2}</Text>

          <Text size='sm' textStyle='body' pl={8}>  <b>{usertesting[0].task1[0].tasknumber3}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].task1[0].description3}</Text>

          <Text size='sm' textStyle='body' pl={8}>  <b>{usertesting[0].followup[0].description}</b></Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].followup[0].question1}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].followup[0].question2}</Text>
          <Text size='sm' textStyle='body' pl={16}>  {usertesting[0].followup[0].question3}</Text>
          
          </VStack>


        </FullScreenSection>

    </main>)

}

export default CaseStudyArchives;
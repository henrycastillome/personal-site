import React, {useState, useEffect} from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  Text,
  Box,
  Divider,
  Circle,
  Stack,
  Flex,
  VStack,
  useTheme,
  HStack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import FullScreenSection from "./FullScreenSection";
import { faAdd, faBriefcase, faChevronUp, faSchool, faUser, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Badges from "./Badges"
import { sortByDate } from "../utils/sortByDate";
import { careerTimelineAPI } from "../api/careerTimelineApi";
import { load } from "recaptcha-v3";

const TimelineCareer = () => {
  const titleText = "Career Timeline";
  const theme = useTheme();
  const secondaryColor = theme.colors.semantic.text.primary;
  const mutedColor = theme.colors.semantic.text.muted;
  const primaryColor = theme.colors.semantic.background.primary;


  //API CALL
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleEntries, setVisibleEntries] = useState([]);
  const [visibleCount] = useState(3);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchTimeLine = async () => {
      try {
        const data = await careerTimelineAPI.getAllEntries();
        setEntries(data);
        setVisibleEntries(data.slice(0, visibleCount));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeLine();
  }, [visibleCount]);


  const loadMore = () => {
    const currentLength = visibleEntries.length;
    const nextEntries = entries.sort(sortByDate).slice(currentLength, currentLength + visibleCount);
    setVisibleEntries(prevElement => [...prevElement, ...nextEntries]);
  }

  useEffect(() => {
    loadMore();
  }, [])

  const collapseAll = () => {
    setVisibleEntries(entries.slice(0, visibleCount));
  }

  if(isLoading) return <FullScreenSection><Spinner /> <Text as="h2">Loading...</Text></FullScreenSection>
  if(error) return <FullScreenSection> <Text as="h2">Error: {error}</Text></FullScreenSection>
 
  
  const getTimeLineElements = () =>{
    return visibleEntries.map((entry, index) => {

      const iconName = entry.icon;
      const icon = iconName === 'faUserGraduate' ? faUserGraduate : faBriefcase;

      return (
        <VerticalTimelineElement
        key={entry.id || index}
        date={entry.date}
        contentStyle={{background: primaryColor, color: secondaryColor}}
        iconStyle={{ background: mutedColor, color: primaryColor }}
        icon={<FontAwesomeIcon icon={icon} />}
      >
        
        <Stack>
          <Text as="h3" textStyle="captionbold" textAlign={'center'}>
            {entry.role}
          </Text>
        </Stack>
        <Stack>
          <Text as="h4" textStyle="caption" textAlign={'center'}>
            {entry.company}
          </Text>
        </Stack>
        <Stack textAlign={"start"}>
          <Text as="p" textStyle="caption">
            {entry.description}
          </Text>
        </Stack>
        <HStack pt={4}>
          <Badges>{entry.tools}</Badges>
        </HStack>
      </VerticalTimelineElement>
      )
      
  })}


  return (
    <FullScreenSection isDarkBackground justifyContent='center' alignItems='center' >
      <Text as="h2" textStyle="h2">
        {titleText.toUpperCase()}
      </Text>
      <VerticalTimeline lineColor={primaryColor}>
        {getTimeLineElements()}

        {visibleEntries.length < entries.length &&(
          <VerticalTimelineElement iconOnClick={loadMore} icon = {<FontAwesomeIcon icon={faAdd} />} iconStyle={{ background: secondaryColor, color: primaryColor, cursor:'pointer' }}/>
          
        )}

        {visibleEntries.length=== entries.length && visibleEntries.length > visibleCount && (
          <VerticalTimelineElement iconOnClick={collapseAll} icon = {<FontAwesomeIcon icon={faChevronUp} />} iconStyle={{ background: primaryColor, color: secondaryColor, cursor:'pointer' }}/>
          
        )}

      </VerticalTimeline>
    </FullScreenSection>
  );
};

export default TimelineCareer;

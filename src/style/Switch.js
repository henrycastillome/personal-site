import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(switchAnatomy.keys)

const baseStyle = definePartsStyle({
  
  container: {
   
  },
  thumb: {
    bg: '#EFF1F3',
   
    
  },
  track: {
    bg: '#696773',

    _checked: {
      bg: '#00A4BD',
    },
  },
})

export const switchTheme = defineMultiStyleConfig({ baseStyle })
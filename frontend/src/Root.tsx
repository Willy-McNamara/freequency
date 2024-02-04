import React from "react";
import { Link, Outlet } from 'react-router-dom'
import { Flex, Box } from "@chakra-ui/react";

const Root = () => {
  return(
    <Flex
      direction="column"
      align="center"
    >
        <h1>Route shell</h1>
        <Flex position="absolute" left="10vw" top="10vh" direction="column" align="center">
          <Link to="Feed">Feed</Link>
          <Link to="Profile">Profile</Link>
          <Link to="Practice">Practice</Link>
        </Flex>
        <Outlet />
      </Flex>
  )
}

export default Root;
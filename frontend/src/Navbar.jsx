import { Box, Button, Container, Flex, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const Navbar = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	return (
		<Container maxW={"1200px"}>
			<Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.200", "gray.700")}>
				<Flex h='16' alignItems={"center"} justifyContent={"space-between"}>
					{/* Left side */}
					<Flex
						alignItems={"center"}
						justifyContent={"center"}
						gap={3}
						display={'flex'}
					>
						
						<Text 
                        fontSize={"40px"}
                        bgGradient={"linear(to-r, pink.400, blue.500)"} 
                        bgClip={"text"}
                        fontWeight={"bold"}
                        
                        >PDFly</Text>

						
					</Flex>
					{/* Right side */}
					<Flex gap={3} alignItems={"center"}>
						

						<Button onClick={toggleColorMode}>
							{colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
						</Button>
						
					</Flex>
				</Flex>
			</Box>
		</Container>
	);
};
export default Navbar;

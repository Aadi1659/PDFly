import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Box, Button, ButtonGroup, Stack, Text, Container, Flex, Input, Textarea } from '@chakra-ui/react'
import { FaCopy } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [summarisedText, setSummarisedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // State to manage processing status
  const [pdfFileName, setPdfFileName] = useState('');


  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
    if (event.target.files[0]) {
      setPdfFileName(event.target.files[0].name);
    }
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleSubmit = async () => {
    if (!pdfFile || !apiKey) {
      alert('Please provide both a PDF file and an API key.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    formData.append('api_key', apiKey);

    setIsProcessing(true); // Disable the button and show the "Please wait..." message

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedText(response.data.extracted_text);
      setSummarisedText(response.data.summarised_text);
    } catch (error) {
      setExtractedText('Error extracting text from PDF');
      setSummarisedText('Error summarizing text');
    } finally {
      setIsProcessing(false); // Re-enable the button and hide the "Please wait..." message
    }
  };

  const handleCopy = (text)=>{
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  }

  return (
    <Stack className="App" minH={'100vh'} >
      <Navbar />
      <Container maxW={'1200px'} >
      <Text 
        fontSize={{base:"3xl",md:"6xl"}}
        bgGradient={"linear(to-r, pink.400, blue.500)"} 
        bgClip={"text"}
        fontWeight={"bold"}
        textAlign={"center"}
        mb={8}
      >PDFly - A Simple PDF Extractor and Summarizer</Text>

      <Container>
        <Flex gap={4} direction={'column'} >
          <Flex gap={4} >
            <Button
              as="label"
              htmlFor="pdf-upload"
              colorScheme="blue"
              cursor="pointer"
              variant={'outline'}
            >
              Upload PDF
            </Button>
            <Input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              display="none"
            />
            <Text>{pdfFileName || "No file selected"}</Text>
          </Flex>
          <Flex gap={4}>
            <Input
              type="text"
              placeholder="Enter API key"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing} 
              bgGradient={"linear(to-r, pink.400, blue.500)"}
              color={'white'}
              _hover={{
                  transform: "scale(1.05)",
                  color: "white",
                }}  >
              {isProcessing ? 'Loading...' : 'PDFly!'}
            </Button>
            
          </Flex>
          {isProcessing && <Text m={4} bgGradient={"linear(to-r, pink.400, blue.500)"} bgClip={"text"} fontSize={'2xl'} fontWeight={"bold"} textAlign={"center"} >Good Things are going to happen! Please Wait!</Text>}
        </Flex>
          
      </Container>
      
    
      <Flex direction={'column'} m={10} gap={5} >
        
        <Flex direction={'column'} >
          <Flex gap={5} mb={2}>
            <Text fontWeight={'bold'} fontSize={'2xl'} >Extracted Text</Text>
            <Button 
                  onClick={() => handleCopy(extractedText)} 
                  colorScheme="pink"
                  variant={'outline'}
                  _hover={{transform: "scale(1.05)"}}
                >
                <FaCopy size={20} />
            </Button>
          </Flex>
            <Textarea
              rows="10"
              cols="80"
              value={extractedText}
              readOnly
              
            />
            
            
        </Flex>
  
        <Flex direction={'column'} >
          <Flex gap={5} mb={2}>
              <Text fontWeight={'bold'} fontSize={'2xl'} >Summarised Text</Text>
              <Button 
                    onClick={()=>handleCopy(summarisedText)} 
                    colorScheme="pink"
                    variant={'outline'}
                    _hover={{transform: "scale(1.05)"}}
                  >
                  <FaCopy size={20} />
              </Button>
            </Flex>
            <Textarea
              rows="10"
              cols="80"
              value={summarisedText}
              readOnly
            />
        </Flex>
      </Flex>
      </Container>
      
      <Text
        m={5}
        textAlign={'center'}
        fontWeight={'bold'}
      >Made by Aaditya Dev Sharma</Text>
    </Stack>
  );
}

export default App;

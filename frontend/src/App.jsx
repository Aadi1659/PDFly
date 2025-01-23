import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Box, Button, Stack, Text, Container, Flex, Input, Textarea, Table, Tbody, Tr, Td,} from '@chakra-ui/react'
import { FaCopy } from "react-icons/fa";

export const BASE_URL = "http://127.0.0.1:5000/api/process-pdf"
export const RENDER_URL = "https://pdfly-yjr8.onrender.com/upload"


function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [summarisedText, setSummarisedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // State to manage processing status
  const [pdfFileName, setPdfFileName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [metadata, setMetadata] = useState({});
  const [responseStatus, setResponseStatus] = useState(false);

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
    if (!pdfFile) {
      alert('Please provide a PDF file!');
      return;
    }

    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    formData.append('api_key', apiKey);

    setIsProcessing(true); // Disable the button and show the "Please wait..." message

    try {
      const response = await axios.post(RENDER_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedText(response.data.text);
      setSummarisedText(response.data.summary);
      setPageCount(response.data.page_count);
      setWordCount(response.data.word_count);
      setMetadata(response.data.metadata);
      setResponseStatus(true)
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

  const formatPDFDate = (dateString) => {
    if (!dateString || !dateString.startsWith('D:')) return dateString;
    
    // Extract date components from D:YYYYMMDDHHmmSS format
    const year = dateString.substring(2, 6);
    const month = dateString.substring(6, 8);
    const day = dateString.substring(8, 10);
    const hour = dateString.substring(10, 12);
    const minute = dateString.substring(12, 14);
    const second = dateString.substring(14, 16);

    // Create a formatted date string
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toLocaleString();
  };

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
        <Flex direction={'column'} gap={5} m={5}  >
          {responseStatus && <Text  fontWeight={'bold'} fontSize={'2xl'}  textAlign={'center'} >Word Count: {wordCount}</Text>}
          {responseStatus && <Text  fontWeight={'bold'} fontSize={'2xl'}  textAlign={'center'} >Page Count: {pageCount}</Text>}
        </Flex>
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
        
        <Flex direction={'column'}>
          <Flex gap={5} mb={2}>
            <Text fontWeight={'bold'} fontSize={'2xl'}>Metadata</Text>
            <Button 
              onClick={() => handleCopy(JSON.stringify(metadata))} 
              colorScheme="pink"
              variant={'outline'}
              _hover={{transform: "scale(1.05)"}}
            >
              <FaCopy size={20} />
            </Button>
          </Flex>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <Tbody>
                {Object.entries(metadata).map(([key, value]) => (
                  <Tr key={key}>
                    <Td style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', fontWeight: 'bold' }}>
                      {key}
                    </Td>
                    <Td style={{ padding: '12px', borderBottom: '1px solid #E2E8F0' }}>
                      {(key === 'CreationDate' || key === 'ModDate') 
                        ? formatPDFDate(value?.toString())
                        : value?.toString() || 'N/A'}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
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

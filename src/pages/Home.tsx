import {
  Button,
  Center,
  FormLabel,
  Heading,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { supabase } from "../util/supabase";

export const Home = () => {
  const [isDropping, setIsDropping] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [allFilesToProcess, setAllFilesToProcess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleFilesDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDropping(false);
    if (files?.length && files?.length !== 1) {
      alert("Please upload only one file at a time");
      setIsDropping(false);
      return;
    }
    for (const file of e.dataTransfer.files) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        setIsDropping(false);
        return;
      }
    }
    setFiles(e.dataTransfer.files);
    setIsDropping(false);
  }

  async function handleUpload() {
    if (!files) {
      return;
    }

    setIsLoading(true);
    const allFilesToProcess: string[] = [];

    for await (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      axios
        .post("https://manga-senseii.onrender.com/upload-pdf/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
        })
        .then(async (res) => {
          const { data, error } = await supabase.storage
            .from("output-files")
            .download(res.data.Key.split("/")[1]);

          if (error) {
            console.error(error);
            alert(
              "An error occurred while downloading the file, please try again"
            );
            setIsLoading(false);
            setFiles(null);
            return;
          } else {
            var fileURL = window.URL.createObjectURL(data);
            window.open(fileURL);
            setIsLoading(false);
            setFiles(null);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  return (
    <Center w="100vw" h="100vh" flexDir="column" gap={4} pb={16}>
      <Heading>マンガ先生</Heading>
      <Stack align="center" gap={8}>
        <Stack gap={0} align="center">
          <Heading fontSize="2xl" color="gray.700">
            Translate your favorite manga
          </Heading>
          <Text>Upload your file(s) here</Text>
        </Stack>
        <Input
          type="file"
          hidden
          id="file-upload"
          //multiple
          accept="application/pdf"
          onChange={(e) => {
            setFiles(e.target.files);
          }}
        />
        <FormLabel htmlFor="file-upload">
          <Stack
            borderRadius="lg"
            as="span"
            h="40vh"
            w="30vw"
            border="2px dashed"
            borderColor={isDropping ? "blue.300" : "gray.300"}
            align="center"
            justify="center"
            cursor="pointer"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropping(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDropping(false);
            }}
            onDrop={handleFilesDrop}
          >
            {isLoading ? (
              <Spinner size="xl" color="blue.500" />
            ) : (
              <>
                <Image
                  src={
                    isDropping ? "/upload-file.png" : "/upload-file-holder.png"
                  }
                  h="30%"
                  w="auto"
                  objectFit="contain"
                />
                <Text color="gray.400" textAlign="center">
                  {files?.length && files?.length > 0
                    ? `${files.length} file(s) selected`
                    : "Drag and drop your PDF file(s) here"}
                </Text>
              </>
            )}
          </Stack>
        </FormLabel>
        <Button
          w="30vw"
          isDisabled={!files?.length || files?.length === 0}
          colorScheme="blue"
          onClick={handleUpload}
          isLoading={isLoading}
        >
          Upload
        </Button>
      </Stack>
    </Center>
  );
};

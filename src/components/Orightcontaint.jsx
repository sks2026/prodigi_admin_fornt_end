import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import "./OverviewZero.css";
import JoditEditor from "jodit-react";
import {
  Input,
  Button,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Space,
  Row,
  Col,
  Typography,
  Card,
  Modal,
} from "antd";
import { CiCirclePlus } from "react-icons/ci";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { Country, State, City } from "country-state-city";

const { Option } = Select;
const { Title, Text } = Typography;

const Orightcontaint = ({ fun, ID, organizerData }) => {
  const { id } = useParams();
  const [showImage, setShowImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const editor = useRef(null);
  const saveTimeoutRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("user_Data"));
  const userId = userData?._id;
  
  // Use ID from props if available, otherwise use id from params
  const competitionId = ID || id;
  
  // Get organizer ID - use organizerData if available (from modal), otherwise use userId (from params/direct route)
  const organizerId = organizerData?._id || userId;

  const [competitionData, setCompetitionData] = useState({
    name: "",
    image: "",
    description: "",
    stages: [
      {
        id: Date.now(),
        name: "",
        date: "",
        endDate: "",
        mode: "Online",
        participation: "Individual",
        location: ["IN"],
        duration: "",
      },
    ],
  });

  const [isFormValid, setIsFormValid] = useState(false);
  
  // Location selection states - removed global states as each stage will have its own

  // Get location options
  const countries = useMemo(() => Country.getAllCountries(), []);

  // Get states for a specific country
  const getStatesForCountry = useCallback((countryCode) => {
    return State.getStatesOfCountry(countryCode);
  }, []);

  // Get cities for a specific country and state
  const getCitiesForState = useCallback((countryCode, stateCode) => {
    return City.getCitiesOfState(countryCode, stateCode);
  }, []);

  // Handle country change for a specific stage
  const handleCountryChange = useCallback((stageId, countryCode) => {
    setCompetitionData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { 
              ...stage, 
              location: [countryCode] // Reset to only country
            } 
          : stage
      )
    }));
  }, []);

  // Handle state change for a specific stage
  const handleStateChange = useCallback((stageId, stateCode) => {
    setCompetitionData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { 
              ...stage, 
              location: [stage.location[0] || "IN", stateCode] // Keep country, add state
            } 
          : stage
      )
    }));
  }, []);

  // Handle city change for a specific stage
  const handleCityChange = useCallback((stageId, cityName) => {
    setCompetitionData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { 
              ...stage, 
              location: [stage.location[0] || "IN", stage.location[1] || "", cityName] // Keep country and state, add city
            } 
          : stage
      )
    }));
  }, []);

  // Strip HTML to plain text
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // JoditEditor configuration - using useMemo to prevent re-creation
  const editorConfig = useMemo(() => ({
    placeholder:
      "Tell the students about the competition and why they should register for this one.",
    height: 400,
    toolbarAdaptive: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
    ],
    removeButtons: ["fullsize", "about"],
    uploader: {
      insertImageAsBase64URI: true,
    },
    style: {
      fontSize: "14px",
    },
    // Add these options to prevent editor refresh issues
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
    events: {
      // Prevent unnecessary events that cause refresh
      beforeInit: function(editor) {
        // Custom initialization if needed
      }
    }
  }), []);

  // Update competition field - using useCallback to prevent re-creation
  const updateCompetitionField = useCallback((field, value) => {
    setCompetitionData((prev) => {
      // Only update if value actually changed
      if (prev[field] === value) {
        return prev;
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

           // Add a new stage
    const addStage = useCallback(() => {
      const newStage = {
        id: Date.now(),
        name: "",
        date: "",
        endDate: "",
        mode: "Online",
        participation: "Individual",
        location: ["IN"], // Default to India
        duration: "",
      };
      setCompetitionData((prev) => ({
        ...prev,
        stages: [...prev.stages, newStage],
      }));
    }, []);

  // Remove a stage
  const removeStage = useCallback((stageId) => {
    setCompetitionData((prev) => ({
      ...prev,
      stages: prev.stages.filter((stage) => stage.id !== stageId),
    }));
  }, []);

  // Update stage field
  const updateStage = useCallback((stageId, field, value) => {
    setCompetitionData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId ? { ...stage, [field]: value } : stage
      ),
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((event) => {
    console.log("Image upload triggered", event.target.files);
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name, file.size, file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File read complete");
        const base64Image = reader.result;
        setShowImage(base64Image);
        setFileName(file.name);
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setFileSize(sizeInMB);
        
        // Update competition data with both file and base64
        setCompetitionData((prev) => {
          const newData = {
            ...prev,
            image: file,
            imageBase64: base64Image, // Store base64 for persistence
            imageName: file.name,
            imageSize: sizeInMB
          };
          
          // Save to localStorage immediately with base64 data
          if (competitionId) {
            const localKey = `competition_overview_${competitionId}`;
            const dataToSave = {
              ...newData,
              image: base64Image, // Save base64 instead of File object
              imageFile: file.name // Save file name for reference
            };
            localStorage.setItem(localKey, JSON.stringify(dataToSave));
          }
          
          return newData;
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  }, [competitionId]);

  // Remove uploaded image
  const handleRemoveImage = useCallback(() => {
    setShowImage("");
    setFileName("");
    setFileSize(0);
    setCompetitionData((prev) => {
      const newData = {
        ...prev,
        image: "",
        imageBase64: "",
        imageName: "",
        imageSize: 0
      };
      
      // Clear from localStorage
      if (competitionId) {
        const localKey = `competition_overview_${competitionId}`;
        localStorage.setItem(localKey, JSON.stringify(newData));
      }
      
      return newData;
    });
  }, [competitionId]);

  // Debounced save function to prevent excessive localStorage writes
  const debouncedSave = useCallback((data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      const localKey = `competition_overview_${competitionId}`;
      
      // Handle image data properly for localStorage
      let dataToSave = { ...data };
      
      // If image is a File object, we need to handle it specially
      if (data.image instanceof File) {
        // For File objects, we'll save the file info but not the actual file
        // The file will be handled separately in handleImageUpload
        dataToSave = {
          ...data,
          image: data.imageBase64 || data.image.name, // Save base64 or filename
          imageSize: data.imageSize || (data.image.size / (1024 * 1024)).toFixed(2)
        };
      } else if (data.imageBase64) {
        // If we have base64 data, use that
        dataToSave = {
          ...data,
          image: data.imageBase64
        };
      }
      
      localStorage.setItem(localKey, JSON.stringify(dataToSave));
    }, 1000); // Save after 1 second of inactivity
  }, [competitionId]);

  // Handle editor content change - using useCallback to prevent re-creation
  const handleEditorChange = useCallback((newContent) => {
    // Only update if content actually changed to prevent unnecessary re-renders
    setCompetitionData((prev) => {
      if (prev.description === newContent) {
        return prev; // Return same reference if no change
      }
      const newData = {
        ...prev,
        description: newContent,
      };
      // Debounced save to localStorage
      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Validate form
  useEffect(() => {
    const isOverviewValid =
      competitionData.name.trim() !== "" &&
      stripHtml(competitionData.description).trim() !== "" &&
      competitionData.image !== "";

    const areStagesValid = competitionData.stages.every(
      (stage) =>
        stage.name.trim() !== "" &&
        stage.date !== "" &&
        stage.mode.trim() !== "" &&
        stage.participation.trim() !== "" &&
        stage.location.length > 0 &&
        stage.location[0] && // At least country should be selected
        stage.duration.trim() !== ""
    );

    const formValid = isOverviewValid && areStagesValid;

    // Debug logging
    console.log("Form Validation:", {
      isOverviewValid,
      areStagesValid,
      formValid,
      competitionData: {
        name: competitionData.name,
        hasDescription: competitionData.description ? true : false,
        hasImage: competitionData.image ? true : false,
        stagesCount: competitionData.stages.length
      }
    });

    setIsFormValid(formValid);
  }, [competitionData.name, competitionData.description, competitionData.image, competitionData.stages]);

  // Save to localStorage when competitionData changes (debounced)
  useEffect(() => {
    if (competitionId && competitionData.name) {
      debouncedSave(competitionData);
    }
  }, [competitionId, competitionData.name, competitionData.description, competitionData.stages, debouncedSave]);

  // This useEffect is no longer needed since we removed global location states

  // Sync image state when competitionData changes
  useEffect(() => {
    if (competitionData.image) {
      if (typeof competitionData.image === "string") {
        // If it's a URL or base64 string
        if (!showImage || showImage !== competitionData.image) {
          setShowImage(competitionData.image);
        }
        if (competitionData.imageName && fileName !== competitionData.imageName) {
          setFileName(competitionData.imageName);
        }
        if (competitionData.imageSize && fileSize !== competitionData.imageSize) {
          setFileSize(competitionData.imageSize);
        }
      } else if (competitionData.image instanceof File) {
        // If it's a File object
        const fileUrl = URL.createObjectURL(competitionData.image);
        if (!showImage || showImage !== fileUrl) {
          setShowImage(fileUrl);
        }
        if (fileName !== competitionData.image.name) {
          setFileName(competitionData.image.name);
        }
        const sizeInMB = (competitionData.image.size / (1024 * 1024)).toFixed(2);
        if (fileSize !== sizeInMB) {
          setFileSize(sizeInMB);
        }
      }
    } else if (competitionData.image === "" && showImage) {
      // Clear image state if image is empty
      setShowImage("");
      setFileName("");
      setFileSize(0);
    }
  }, [competitionData.image, competitionData.imageName, competitionData.imageSize]);

  // Fetch overview data if ID exists
  const getOverview = async () => {
    if (!competitionId) return;
    
    // Check localStorage first
    const localKey = `competition_overview_${competitionId}`;
    const saved = localStorage.getItem(localKey);
    
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setCompetitionData(savedData);
        
        // Set image preview if available
        if (savedData.image) {
          if (typeof savedData.image === "string") {
            // If it's a URL string (from API) or base64 data
            setShowImage(savedData.image);
            setFileName(savedData.imageName || savedData.imageFile || savedData.image.split("/").pop() || "Uploaded Image");
            setFileSize(savedData.imageSize || 0);
          } else if (savedData.image instanceof File) {
            // If it's a File object (from file input)
            setShowImage(URL.createObjectURL(savedData.image));
            setFileName(savedData.image.name);
            setFileSize((savedData.image.size / (1024 * 1024)).toFixed(2));
          }
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
    
    try {
      const response = await fetch(
        `https://api.prodigiedu.com/api/competitions/getoverview/${competitionId}`,
        {
          method: "GET",
          redirect: "follow",
        }
      );
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success && result.data) {
        const fetchedData = result.data;
        
        // Normalize stages to ensure all required fields
        const normalizedStages = fetchedData.stages?.length
          ? fetchedData.stages.map((stage, index) => ({
              id: stage.id || Date.now() + index,
              name: stage.name || "",
              date: stage.date ? dayjs(stage.date).format("YYYY-MM-DD") : "",
              endDate: stage.endDate
                ? dayjs(stage.endDate).format("YYYY-MM-DD")
                : "",
              mode: stage.mode || "Online",
              participation: stage.participation || "Individual",
              location: Array.isArray(stage.location)
                ? stage.location
                : ["IN"],
              duration: stage.duration || "",
            }))
          : [
              {
                id: Date.now(),
                name: "",
                date: "",
                endDate: "",
                mode: "Online",
                participation: "Individual",
                location: ["IN"],
                duration: "",
              },
            ];

        const updatedCompetitionData = {
          name: fetchedData.name || "",
          description: fetchedData.description || "",
          image: fetchedData.image || "",
          stages: normalizedStages,
        };

        setCompetitionData(updatedCompetitionData);
        console.log("Updated competitionData:", updatedCompetitionData);

        // Handle image from API
        if (fetchedData.image) {
          const imageUrl = fetchedData.image.startsWith("http")
            ? fetchedData.image
            : `https://api.prodigiedu.com${fetchedData.image}`;
          setShowImage(imageUrl);
          setFileName(fetchedData.image.split("/").pop() || "Uploaded Image");
          setFileSize(fetchedData.imageSize || 0);
          
          // Update localStorage with API data
          localStorage.setItem(localKey, JSON.stringify({
            ...updatedCompetitionData,
            image: imageUrl, // Save the full URL
            imageSize: fetchedData.imageSize || 0
          }));
        }
      } else {
        console.error("No valid data found in response:", result);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  };

  useEffect(() => {
    getOverview();
  }, [competitionId]);

  // Persist competitionData to localStorage on change (only for non-image changes)
  useEffect(() => {
    if (competitionId && competitionData.name) {
      // Don't save if this is just an image change - that's handled in handleImageUpload
      if (!competitionData.image || typeof competitionData.image === "string") {
        const localKey = `competition_overview_${competitionId}`;
        const dataToSave = { ...competitionData };
        
        // If image is a File object, don't save it to localStorage
        if (dataToSave.image instanceof File) {
          dataToSave.image = dataToSave.imageBase64 || dataToSave.imageName || "";
        }
        
        localStorage.setItem(localKey, JSON.stringify(dataToSave));
      }
    }
  }, [competitionId, competitionData.name, competitionData.description, competitionData.stages]);

  // Save or update competition data
  const handleSave = useCallback(async () => {
    try {
      const formdata = new FormData();
      formdata.append("organizerId", organizerId);
      formdata.append("name", competitionData.name);
      formdata.append("description", competitionData.description);
      
      // Handle image data properly
      if (competitionData.image) {
        if (competitionData.image instanceof File) {
          // If it's a new file, append it to FormData
          formdata.append("image", competitionData.image);
        } else if (typeof competitionData.image === "string" && competitionData.image.trim() !== "") {
          // If it's an existing image URL or base64, we might need to handle it differently
          // For now, we'll skip it if it's already a URL
          console.log("Image already exists:", competitionData.image);
        }
      }
      
      formdata.append("user_id", userId);
      formdata.append("stages", JSON.stringify(competitionData.stages));

      const url = competitionId
        ? `https://api.prodigiedu.com/api/competitions/updateoverview/${competitionId}`
        : `https://api.prodigiedu.com/api/competitions/overview`;

      const method = competitionId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formdata,
        redirect: "follow",
      });

      const result = await response.json();
      console.log("Save/Update Response:", result);
      
      // Pass the ID to next step - use existing ID for updates, new ID for creates
      const resultId = competitionId || result._id;
      
      // Clear localStorage for this step on successful save
      if (competitionId) {
        localStorage.removeItem(`competition_overview_${competitionId}`);
      } else if (result._id) {
        localStorage.removeItem(`competition_overview_${result._id}`);
      }
      
      fun(1, resultId);
    } catch (error) {
      console.error(`${competitionId ? "Update" : "Save"} error:`, error);
    }
  }, [competitionData, userId, organizerId, competitionId, fun]);

  const [deleteModal, setDeleteModal] = useState({ open: false, stageId: null });

  return (
    <div style={{
      padding: "24px",
      backgroundColor: "#fff",
      minHeight: "100vh",
      paddingBottom: "120px"
    }}>
      <Title
        level={2}
        style={{ marginBottom: "24px", color: "#000", fontWeight: 500 }}
      >
        Competition Overview
      </Title>

      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ color: "#000" }}>
              Name<span style={{ color: "#ef4444" }}>*</span>
            </Text>
            <Input
              placeholder="Create a unique name for your competition"
              value={competitionData.name}
              onChange={(e) => updateCompetitionField("name", e.target.value)}
              size="large"
            />
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ color: "#000" }}>
              Image<span style={{ color: "#4CAF50" }}>*</span>
            </Text>
            <div>
                             <input
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                 style={{ display: "none" }}
                 id="image-upload"
                 ref={(input) => {
                   if (input) {
                     console.log("File input ref set:", input);
                   }
                 }}
               />
              {!showImage ? (
                                 <Button
                   type="primary"
                   icon={<CiCirclePlus size={16} />}
                   onClick={() => {
                     console.log("Upload button clicked");
                     const fileInput = document.getElementById("image-upload");
                     console.log("File input element:", fileInput);
                     if (fileInput) {
                       fileInput.click();
                     } else {
                       console.error("File input not found");
                     }
                   }}
                   size="large"
                   style={{
                     backgroundColor: "#4CAF50",
                     borderColor: "#10b981",
                     borderRadius: "8px",
                     height: "40px",
                     display: "flex",
                     alignItems: "center",
                     gap: "8px",
                     fontWeight: "500",
                   }}
                 >
                   Upload Image
                 </Button>
              ) : (
                                 <div style={{ 
                   display: "flex", 
                   alignItems: "center", 
                   gap: "16px",
                   padding: "12px",
                   border: "1px solid #e5e7eb",
                   borderRadius: "8px",
                   backgroundColor: "#f9fafb"
                 }}>
                   <img
                     src={showImage}
                     alt="Competition"
                     style={{ 
                       width: "60px", 
                       height: "60px", 
                       objectFit: "cover",
                       borderRadius: "8px"
                     }}
                   />
                   <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                     <Text style={{ fontWeight: "600", fontSize: "14px", color: "#000" }}>
                       {fileName}
                     </Text>
                     <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                       {fileSize} MB
                     </Text>
                   </div>
                   <Button
                     type="text"
                     size="small"
                     icon={<X size={16} />}
                     onClick={handleRemoveImage}
                     style={{
                       color: "#ef4444",
                       border: "1px solid #ef4444",
                       borderRadius: "6px",
                       minWidth: "32px",
                       height: "32px",
                     }}
                   />
                 </div>
              )}
            </div>
          </Space>
        </Col>
      </Row>

      <div style={{ marginBottom: "32px" }}>
        <Text
          strong
          style={{
            color: "#000",
            fontSize: "16px",
            display: "block",
            marginBottom: "12px",
          }}
        >
          Competition Description<span style={{ color: "#ef4444" }}>*</span>
        </Text>
        <Card
          style={{
            boxShadow: "0px 0px 20px 0px #00000012",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
          }}
        >
          <JoditEditor
            key={`editor-${competitionId}`}
            ref={editor}
            value={competitionData.description || ""}
            config={editorConfig}
            onChange={handleEditorChange}
            tabIndex={1}
          />
        </Card>
      </div>

      <div>
        <Title level={3} style={{ marginBottom: "16px", color: "#000" }}>
          Stages
        </Title>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {competitionData.stages.map((stage, index) => (
            <Card
              key={stage.id}
              style={{
                boxShadow: "0px 0px 20px 0px #00000012",
                borderRadius: "12px",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div className="stage-header-container">
                <Title level={4} className="stage-title">
                  Stage {index + 1}
                </Title>
                {competitionData.stages.length > 1 && (
                  <Button
                    type="text"
                    size="small"
                    icon={<X size={16} />}
                    onClick={() => setDeleteModal({ open: true, stageId: stage.id })}
                    className="remove-stage-btn"
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Name Field */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "32px" }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <Text strong style={{ color: "#000", fontSize: "14px" }}>
                      Name<span style={{ color: "#ef4444" }}>*</span>
                    </Text>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      placeholder="Name of the Stage"
                      value={stage.name}
                      onChange={(e) =>
                        updateStage(stage.id, "name", e.target.value)
                      }
                      size="large"
                      style={{ fontSize: "14px", height: "40px" }}
                    />
                  </div>
                </div>

                {/* Date Field */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "32px" }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <Text strong style={{ color: "#000", fontSize: "14px" }}>
                      Date<span style={{ color: "#ef4444" }}>*</span>
                    </Text>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                                         <DatePicker
                       placeholder="Select"
                       value={stage.date ? dayjs(stage.date) : null}
                       onChange={(date, dateString) =>
                         updateStage(stage.id, "date", dateString)
                       }
                       size="large"
                       style={{ width: "160px", height: "40px" }}
                       format="YYYY-MM-DD"
                       disabledDate={(current) => {
                         return current && current < dayjs().startOf('day');
                       }}
                       styles={{ popup: { zIndex: 10000 } }}
                       getPopupContainer={(trigger) => trigger.parentElement}
                       allowClear
                       open={undefined}
                     />
                    {stage.endDate && (
                      <>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            margin: "0 8px",
                          }}
                        >
                          to
                        </Text>
                                                 <DatePicker
                           placeholder="Select"
                           value={stage.endDate ? dayjs(stage.endDate) : null}
                           onChange={(date, dateString) =>
                             updateStage(stage.id, "endDate", dateString)
                           }
                           size="large"
                           style={{ width: "160px", height: "40px" }}
                           format="YYYY-MM-DD"
                           disabledDate={(current) => {
                             return current && current < dayjs(stage.date).startOf('day');
                           }}
                           styles={{ popup: { zIndex: 10000 } }}
                           getPopupContainer={(trigger) => trigger.parentElement}
                           allowClear
                           open={undefined}
                         />
                      </>
                    )}
                    <Checkbox
                      checked={!!stage.endDate}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const endDateValue =
                            stage.date || dayjs().format("YYYY-MM-DD");
                          updateStage(stage.id, "endDate", endDateValue);
                        } else {
                          updateStage(stage.id, "endDate", "");
                        }
                      }}
                      style={{ marginLeft: "16px" }}
                    >
                      <Text style={{ color: "#757575", fontSize: "14px" }}>
                        Add a Date Range
                      </Text>
                    </Checkbox>
                  </div>
                </div>

                {/* Mode and Participation Row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "32px" }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <Text strong style={{ color: "#000", fontSize: "14px" }}>
                      Mode<span style={{ color: "#ef4444" }}>*</span>
                    </Text>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "80px",
                    }}
                  >
                                         <div
                       style={{
                         display: "flex",
                         gap: "8px",
                       }}
                     >
                                               <button
                          onClick={() => updateStage(stage.id, "mode", "Online")}
                          style={{
                            padding: "8px 24px",
                            fontSize: "14px",
                            fontWeight: "500",
                            border: "1px solid #10b981",
                            cursor: "pointer",
                            backgroundColor: stage.mode === "Online" ? "#4CAF50" : "transparent",
                            color: stage.mode === "Online" ? "#ffffff" : "#4CAF50",
                            borderRadius: "25px",
                            transition: "all 0.2s ease",
                            minWidth: "80px",
                          }}
                        >
                          Online
                        </button>
                        <button
                          onClick={() => updateStage(stage.id, "mode", "Offline")}
                          style={{
                            padding: "8px 24px",
                            fontSize: "14px",
                            fontWeight: "500",
                            border: "1px solid #10b981",
                            cursor: "pointer",
                            backgroundColor: stage.mode === "Offline" ? "#4CAF50" : "transparent",
                            color: stage.mode === "Offline" ? "#ffffff" : "#4CAF50",
                            borderRadius: "25px",
                            transition: "all 0.2s ease",
                            minWidth: "80px",
                          }}
                        >
                          Offline
                        </button>
                     </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#000",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Participation<span style={{ color: "#ef4444" }}>*</span>
                      </Text>
                                             <div
                         style={{
                           display: "flex",
                           gap: "8px",
                         }}
                       >
                                                   <button
                            onClick={() => updateStage(stage.id, "participation", "Individual")}
                            style={{
                              padding: "8px 24px",
                              fontSize: "14px",
                              fontWeight: "500",
                              border: "1px solid #10b981",
                              cursor: "pointer",
                              backgroundColor: stage.participation === "Individual" ? "#4CAF50" : "transparent",
                              color: stage.participation === "Individual" ? "#ffffff" : "#4CAF50",
                              borderRadius: "25px",
                              transition: "all 0.2s ease",
                              minWidth: "80px",
                            }}
                          >
                            Individual
                          </button>
                                                     <button
                             onClick={() => updateStage(stage.id, "participation", "School")}
                             style={{
                               padding: "8px 24px",
                               fontSize: "14px",
                               fontWeight: "500",
                               border: "1px solid #10b981",
                               cursor: "pointer",
                               backgroundColor: stage.participation === "School" ? "#4CAF50" : "transparent",
                               color: stage.participation === "School" ? "#ffffff" : "#4CAF50",
                               borderRadius: "25px",
                               transition: "all 0.2s ease",
                               minWidth: "80px",
                             }}
                           >
                             School
                           </button>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Locations Field */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "32px" }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <Text strong style={{ color: "#000", fontSize: "14px" }}>
                      Location<span style={{ color: "#ef4444" }}>*</span>
                    </Text>
                  </div>
                  <div style={{ flex: 1, display: "flex", gap: "12px" }}>
                    {/* Country Select */}
                    <Select
                      placeholder="Select Country/देश चुनें"
                      style={{ width: "200px" }}
                      size="large"
                      value={stage.location[0] || "IN"}
                      onChange={(value) => handleCountryChange(stage.id, value)}
                      suffixIcon={<ChevronDown size={16} />}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 10000 }}
                      getPopupContainer={(trigger) => trigger.parentElement}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      optionFilterProp="children"
                    >
                      {countries && countries.length > 0 ? (
                        countries.map(country => (
                          <Option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </Option>
                        ))
                      ) : (
                        <Option value="IN">India</Option>
                      )}
                    </Select>

                    {/* State Select */}
                    <Select
                      placeholder="Select State/राज्य चुनें"
                      style={{ width: "200px" }}
                      size="large"
                      value={stage.location[1] || ""}
                      onChange={(value) => handleStateChange(stage.id, value)}
                      suffixIcon={<ChevronDown size={16} />}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 10000 }}
                      getPopupContainer={(trigger) => trigger.parentElement}
                      disabled={!stage.location[0]}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      optionFilterProp="children"
                    >
                      {getStatesForCountry(stage.location[0] || "IN").length > 0 ? (
                        getStatesForCountry(stage.location[0] || "IN").map(state => (
                          <Option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </Option>
                        ))
                      ) : (
                        <Option value="" disabled>No states available</Option>
                      )}
                    </Select>

                    {/* City Select */}
                    <Select
                      placeholder="Select City/शहर चुनें"
                      style={{ width: "200px" }}
                      size="large"
                      value={stage.location[2] || ""}
                      onChange={(value) => handleCityChange(stage.id, value)}
                      suffixIcon={<ChevronDown size={16} />}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 10000 }}
                      getPopupContainer={(trigger) => trigger.parentElement}
                      disabled={!stage.location[1]}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      optionFilterProp="children"
                    >
                      {getCitiesForState(stage.location[0] || "IN", stage.location[1] || "").length > 0 ? (
                        getCitiesForState(stage.location[0] || "IN", stage.location[1] || "").map(city => (
                          <Option key={city.name} value={city.name}>
                            {city.name}
                          </Option>
                        ))
                      ) : (
                        <Option value="" disabled>No cities available</Option>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Duration Field */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "32px" }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <Text strong style={{ color: "#000", fontSize: "14px" }}>
                      Duration<span style={{ color: "#ef4444" }}>*</span>
                    </Text>
                  </div>
                  <div style={{ flex: 1, maxWidth: "300px" }}>
                                         <Input
                       placeholder="Enter Duration"
                       value={stage.duration}
                       onChange={(e) =>
                         updateStage(stage.id, "duration", e.target.value)
                       }
                       size="large"
                       style={{ fontSize: "14px", height: "40px" }}
                     />
                  </div>
                </div>
              </div>
            </Card>
          ))}

                                                                                       <Button
               onClick={addStage}
               icon={<CiCirclePlus size={16} />}
               size="large"
               style={{
                 backgroundColor: "#ffffff",
                 color: "#3b82f6",
                 borderRadius: "8px",
                 height: "40px",
                 display: "flex",
                 alignItems: "center",
                 gap: "8px",
                 fontWeight: "500",
                 border: "none",
               }}
             >
               Add Stage
             </Button>
        </Space>
      </div>

      {/* Validation Status - For Debugging */}
      <div style={{
        marginTop: "20px",
        padding: "16px",
        backgroundColor: isFormValid ? "#d1fae5" : "#fee2e2",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        color: isFormValid ? "#059669" : "#dc2626",
        textAlign: "center",
        border: isFormValid ? "2px solid #059669" : "2px solid #dc2626"
      }}>
        {isFormValid ? "✓ Form is valid - Ready to save!" : "⚠ Please fill all required fields"}
      </div>

      {/* Save Button Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "40px",
          marginBottom: "60px",
          padding: "30px 20px",
          borderTop: "3px solid #4CAF50",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid ? "#4CAF50" : "#dadada",
            borderColor: isFormValid ? "#4CAF50" : "#dadada",
            color: isFormValid ? "#fff" : "#888",
            padding: "16px 48px",
            height: "56px",
            fontSize: "18px",
            fontWeight: "700",
            borderRadius: "10px",
            cursor: isFormValid ? "pointer" : "not-allowed",
            boxShadow: isFormValid ? "0 6px 12px rgba(76, 175, 80, 0.4)" : "none",
            transform: isFormValid ? "scale(1)" : "scale(0.95)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (isFormValid) {
              e.target.style.backgroundColor = "#45a049";
              e.target.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (isFormValid) {
              e.target.style.backgroundColor = "#4CAF50";
              e.target.style.transform = "scale(1)";
            }
          }}
        >
          Save and Continue →
        </Button>
      </div>

      <Modal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, stageId: null })}
        footer={null}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <h2>Are you sure you want to delete the stage?</h2>
          <p>All details about the stage would be deleted.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
            <Button
              onClick={() => setDeleteModal({ open: false, stageId: null })}
              style={{ borderColor: "#4CAF50", color: "#4CAF50" }}
            >
              No, Back
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
              onClick={() => {
                removeStage(deleteModal.stageId);
                setDeleteModal({ open: false, stageId: null });
              }}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orightcontaint;
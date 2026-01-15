import { useState, useEffect } from "react";
import {
  Tabs,
  Select,
  Form,
  Button,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Card,
  Tag,
  Checkbox,
  List,
  message,
} from "antd";
import {
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// CSS for spinner animation and tabs styling
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #52c41a !important;
  }
  
  .ant-tabs-ink-bar {
    background: #52c41a !important;
  }
  
  .ant-tabs-tab:hover .ant-tabs-tab-btn {
    color: #52c41a !important;
  }
`;

const OSyllabus = ({ fun, ID }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("");
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [topicsByTab, setTopicsByTab] = useState({});
  const [selectedTopicFromDropdown, setSelectedTopicFromDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [showWeightage, setShowWeightage] = useState(false); // New state for weightage visibility
  const [subjects, setSubjects] = useState([]); // New state for subjects
  const [selectedCategory, setSelectedCategory] = useState("Academic"); // New state for selected category
  const [showSubjectSelector, setShowSubjectSelector] = useState(false); // New state for subject selector visibility
  const [autoSaveInProgress, setAutoSaveInProgress] = useState(false); // New state for auto-save progress
  const [showTopicsField, setShowTopicsField] = useState(false); // New state to control topics field visibility
  
  // Use ID from props if available, otherwise use id from params
  const competitionId = ID || id;

  // Updated subject list from excel sheet with categories
  const subjectCategories = {
    "Academic": [
      "Maths",
      "English", 
      "Physics",
      "Chemistry",
      "Environmental Studies",
      "History",
      "General Knowledge",
      "Computer Science",
      "Biology",
      "Geography",
      "Economics",
      "Literature"
    ],
    "Extra-curricular": [
      "Art",
      "Music",
      "Sports",
      "Drama",
      "Debate",
      "Quiz",
      "Science Fair",
      "Robotics",
      "Coding",
      "Photography",
      "Creative Writing",
      "Brain Games",
      "Fancy Dress",
      "Sloka",
      "Colouring",
      "Singing",
      "Dancing",
      "Drawing",
      "yoga",
      "pickleball"

    ],
    "Others": [
      "Life Skills",
      "Leadership",
      "Communication",
      "Team Building",
      "Problem Solving",
      "Critical Thinking"
    ]
  };

  const allTopics = [
    "Maths",
    "English", 
    "Physics",
    "Chemistry",
    "Environmental Studies",
    "History",
    "General Knowledge",
    "Computer Science",
    "Biology",
    "Geography",
    "Economics",
    "Literature",
    "Art",
    "Music",
    "Sports",
    "Dance",
    "Drama",
    "Debate",
    "Quiz",
    "Science Fair",
    "Robotics",
    "Coding",
    "Photography",
    "Creative Writing"
  ];

  // Updated subtopic list from excel sheet
  const allSubtopics = {
    "Maths": [
      "Algebra",
      "Geometry", 
      "Trigonometry",
      "Calculus",
      "Statistics",
      "Probability",
      "Number Theory",
      "Linear Algebra",
      "Discrete Mathematics",
      "Vector Calculus"
    ],
    "English": [
      "Grammar",
      "Vocabulary",
      "Reading Comprehension",
      "Writing Skills",
      "Literature Analysis",
      "Poetry",
      "Drama",
      "Novel Study",
      "Essay Writing",
      "Creative Writing"
    ],
    "Physics": [
      "Mechanics",
      "Thermodynamics",
      "Electromagnetism",
      "Optics",
      "Modern Physics",
      "Quantum Mechanics",
      "Relativity",
      "Nuclear Physics",
      "Wave Motion",
      "Energy Conservation"
    ],
    "Chemistry": [
      "Organic Chemistry",
      "Inorganic Chemistry",
      "Physical Chemistry",
      "Analytical Chemistry",
      "Biochemistry",
      "Chemical Bonding",
      "Reaction Kinetics",
      "Thermochemistry",
      "Electrochemistry",
      "Surface Chemistry"
    ],
    "Computer Science": [
      "Programming",
      "Data Structures",
      "Algorithms",
      "Database Systems",
      "Computer Networks",
      "Operating Systems",
      "Software Engineering",
      "Artificial Intelligence",
      "Machine Learning",
      "Web Development"
    ]
  };



  const handleSubjectRemove = (subjectName) => {
    const newSubjects = subjects.filter(subject => subject !== subjectName);
    setSubjects(newSubjects);
    autoSaveSubjects(newSubjects);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSubjectToggle = (subjectName) => {
    console.log("Toggling subject:", subjectName);
    console.log("Current subjects before toggle:", subjects);
    
    if (subjects.includes(subjectName)) {
      const newSubjects = subjects.filter(subject => subject !== subjectName);
      console.log("Removing subject, new subjects:", newSubjects);
      setSubjects(newSubjects);
      autoSaveSubjects(newSubjects);
    } else {
      const newSubjects = [...subjects, subjectName];
      console.log("Adding subject, new subjects:", newSubjects);
      setSubjects(newSubjects);
      autoSaveSubjects(newSubjects);
    }
  };

  const toggleSubjectSelector = () => {
    console.log("Toggling subject selector. Current state:", showSubjectSelector);
    const newState = !showSubjectSelector;
    console.log("New state will be:", newState);
    setShowSubjectSelector(newState);
  };

  // Auto-save subjects when they change
  const autoSaveSubjects = async (newSubjects) => {
    if (!competitionId || autoSaveInProgress) return;
    
    setAutoSaveInProgress(true);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      // Create topics array with subjectstype for each subject
      const topicsWithSubjectType = newSubjects.map(subjectName => {
        let subjectType = "Others"; // Default fallback
        
        for (const [category, subjectList] of Object.entries(subjectCategories)) {
          if (subjectList.includes(subjectName)) {
            subjectType = category;
            break;
          }
        }
        
        return {
          name: subjectName,
          weight: 0,
          subtopics: [],
          stage: stages.length > 0 ? stages[0].name : "Default",
          subjectstype: subjectType
        };
      });

      const data = {
        syllabus: {
          topics: topicsWithSubjectType
        }
      };

      console.log("Auto-saving topics with subjectstype:", topicsWithSubjectType);

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: "follow",
      };

      const url = `http://localhost:3001/api/competitions/updatesyllabus/${competitionId}`;
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Topics auto-saved successfully:", result);
      message.success("Topics saved automatically!");
      
    } catch (error) {
      console.error("Error auto-saving topics:", error);
      message.error("Failed to auto-save topics. Please try again.");
    } finally {
      setAutoSaveInProgress(false);
    }
  };

  const handleTopicSelect = (topicName) => {
    const currentTopics = topicsByTab[activeTab] || [];
    if (currentTopics.some((topic) => topic.name === topicName)) {
      return;
    }

    // Add new topic with default weight of 0 instead of forcing equal distribution
    const newTopic = {
      name: topicName,
      weight: 0, // Default to 0, let user set manually
      subtopics: [],
      searchTerm: "",
      searchResults: [],
      selectedSearchItems: [],
    };

    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: [...currentTopics, newTopic],
    });
    setSelectedTopicFromDropdown(null);
  };

  const handleCustomTopicAdd = (topicName) => {
    if (!topicName.trim()) return;
    
    const currentTopics = topicsByTab[activeTab] || [];
    if (currentTopics.some((topic) => topic.name === topicName.trim())) {
      message.warning("This topic already exists");
      return;
    }

    // Add new topic with default weight of 0 instead of forcing equal distribution
    const newTopic = {
      name: topicName.trim(),
      weight: 0, // Default to 0, let user set manually
      subtopics: [],
      searchTerm: "",
      searchResults: [],
      selectedSearchItems: [],
    };

    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: [...currentTopics, newTopic],
    });
  };

  const handleTopicRemove = (index) => {
    const newTopics = (topicsByTab[activeTab] || []).filter((_, i) => i !== index);
    
    // Don't force weightage recalculation - let users maintain their own values
    // setTopicsByTab({
    //   ...topicsByTab,
    //   [activeTab]: newTopics,
    // });
    
    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });

    if (expandedTopics.includes(index)) {
      setExpandedTopics(expandedTopics.filter((i) => i !== index));
    }
  };

  const handleWeightChange = (index, value) => {
    const newTopics = [...(topicsByTab[activeTab] || [])];
    newTopics[index].weight = parseFloat(value) || 0;
    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  const handleSearchChange = (index, value) => {
    const newTopics = [...(topicsByTab[activeTab] || [])];
    newTopics[index].searchTerm = value;

    if (value.trim()) {
      const topicName = newTopics[index].name;
      const availableSubtopics = allSubtopics[topicName] || [];
      const searchResults = availableSubtopics.filter(
        (subtopic) =>
          subtopic.toLowerCase().includes(value.toLowerCase()) &&
          !newTopics[index].subtopics.includes(subtopic)
      );
      newTopics[index].searchResults = searchResults;
    } else {
      newTopics[index].searchResults = [];
    }

    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  const handleSearchItemSelect = (topicIndex, subtopic, checked) => {
    const newTopics = [...(topicsByTab[activeTab] || [])];
    if (checked) {
      if (!newTopics[topicIndex].selectedSearchItems.includes(subtopic)) {
        newTopics[topicIndex].selectedSearchItems.push(subtopic);
      }
    } else {
      newTopics[topicIndex].selectedSearchItems = newTopics[
        topicIndex
      ].selectedSearchItems.filter((item) => item !== subtopic);
    }
    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  const addSelectedSubtopics = (topicIndex) => {
    const newTopics = [...(topicsByTab[activeTab] || [])];
    const selectedItems = newTopics[topicIndex].selectedSearchItems;

    selectedItems.forEach((item) => {
      if (!newTopics[topicIndex].subtopics.includes(item)) {
        newTopics[topicIndex].subtopics.push(item);
      }
    });

    newTopics[topicIndex].searchTerm = "";
    newTopics[topicIndex].searchResults = [];
    newTopics[topicIndex].selectedSearchItems = [];

    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  const removeSubtopic = (topicIndex, subtopicIndex) => {
    const newTopics = [...(topicsByTab[activeTab] || [])];
    newTopics[topicIndex].subtopics.splice(subtopicIndex, 1);
    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  const toggleTopicExpansion = (index) => {
    if (expandedTopics.includes(index)) {
      setExpandedTopics(expandedTopics.filter((i) => i !== index));
    } else {
      setExpandedTopics([...expandedTopics, index]);
    }
  };

  const addWeightage = () => {
    setShowWeightage(true);
    // Don't force equal distribution - let users set their own values
    // Users can manually enter any weightage they want
  };

  const removeWeightage = () => {
    setShowWeightage(false);
    const newTopics = (topicsByTab[activeTab] || []).map((topic) => ({
      ...topic,
      weight: 0,
    }));
    setTopicsByTab({
      ...topicsByTab,
      [activeTab]: newTopics,
    });
  };

  // Show topics based on selected subjects
  const availableTopics = allTopics.filter((topic) => {
    // First, check if topic is not already selected in current tab
    const isAlreadySelected = (topicsByTab[activeTab] || []).some(
      (selectedTopic) => selectedTopic.name === topic
    );

    if (isAlreadySelected) return false;

    // Show topics that match the selected subjects
    return subjects.includes(topic);
  });

  // Create tab items dynamically based on stages
  const tabItems = stages.map((stage) => ({
    key: stage.id.toString(),
    label: stage.name,
  }));

  // Transform data to API format, sending syllabus with topics based on stages
  const transformDataForAPI = () => {
    const topics = [];
    
    stages.forEach((stage) => {
      const stageTopics = topicsByTab[stage.id.toString()] || [];
      stageTopics.forEach((topic) => {
        // Find which category this topic belongs to
        let subjectType = "Others"; // Default fallback
        
        for (const [category, subjectList] of Object.entries(subjectCategories)) {
          if (subjectList.includes(topic.name)) {
            subjectType = category;
            break;
          }
        }
        
        topics.push({
          name: topic.name,
          weight: topic.weight,
          subtopics: topic.subtopics || [],
          stage: stage.name,
          subjectstype: subjectType // Add subjectstype key here
        });
      });
    });

    // Remove the separate subjects array - just send topics with subjectstype
    console.log("All data being sent to API:", { topics });
    
    return { syllabus: { topics } };
  };

  // Get weightage total for display (if needed)
  const getWeightageTotal = () => {
    const currentTopics = topicsByTab[activeTab] || [];
    return currentTopics.reduce((sum, topic) => sum + (topic.weight || 0), 0);
  };

  // Modified saveSyllabus function to handle create or update
  const saveSyllabus = async () => {
    // Check if user has Academic subjects
    const hasAcademicSubjects = subjects.some(subjectName => 
      subjectCategories["Academic"].includes(subjectName)
    );

    let data;
    
    if (hasAcademicSubjects) {
      // For Academic subjects, validate topics
      const allTopics = Object.values(topicsByTab).flat();
      if (allTopics.length === 0) {
        message.warning("Please select at least one topic in any stage before saving.");
        return;
      }

      data = transformDataForAPI();
      const topics = data.syllabus.topics;

      if (!Array.isArray(topics) || topics.length === 0) {
        message.warning("Please select at least one topic in any stage before saving.");
        return;
      }

      // Check if all stages have at least one topic
      const stagesWithoutTopics = stages.filter(stage => {
        const stageTopics = topicsByTab[stage.id.toString()] || [];
        return stageTopics.length === 0;
      });

      if (stagesWithoutTopics.length > 0) {
        const stageNames = stagesWithoutTopics.map(stage => stage.name).join(', ');
        message.warning(
          `Please add at least one topic to the following stage(s): ${stageNames}`
        );
        return;
      }
    } else {
      // For Extra-curricular or Others only, create topics from subjects
      data = {
        syllabus: {
          topics: subjects.map(subjectName => {
            let subjectType = "Others";
            for (const [category, subjectList] of Object.entries(subjectCategories)) {
              if (subjectList.includes(subjectName)) {
                subjectType = category;
                break;
              }
            }
            return {
              name: subjectName,
              weight: 0,
              subtopics: [],
              stage: stages.length > 0 ? stages[0].name : "Default",
              subjectstype: subjectType
            };
          })
        }
      };
    }

    setLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      // Log the payload for debugging
      console.log("Payload being sent to API:", JSON.stringify(data, null, 2));

      const raw = JSON.stringify(data);

      if (!competitionId) {
        message.error("Competition ID is required to save syllabus");
        return;
      }

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const url = `http://localhost:3001/api/competitions/updatesyllabus/${competitionId}`;

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log("Syllabus saved/updated successfully:", result);
      message.success("Syllabus saved successfully!");

      fun(2, competitionId);
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to save syllabus. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch syllabus and update state
  const getsyllabus = async () => {
    if (!competitionId) return;

    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      const response = await fetch(
        `http://localhost:3001/api/competitions/getsyllabus/${competitionId}`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched syllabus:", result);

      // Extract stages from overviewdata
      if (result.overviewdata && Array.isArray(result.overviewdata.stages)) {
        const stagesData = result.overviewdata.stages;
        setStages(stagesData);
        
        // Initialize topicsByTab for each stage
        const initialTopicsByTab = {};
        stagesData.forEach((stage) => {
          initialTopicsByTab[stage.id.toString()] = [];
        });
        
        // Set the first stage as active tab if available
        if (stagesData.length > 0 && !activeTab) {
          setActiveTab(stagesData[0].id.toString());
        }
        
        // Process existing topics if any
        if (result.success && result.data && Array.isArray(result.data.topics)) {
          const topics = result.data.topics;
          console.log("Fetched topics from API:", topics);
          
          if (topics.length > 0) {
            // Group topics by stage
            stagesData.forEach((stage) => {
              const stageTopics = topics
                .filter((topic) => {
                  // Match by stage name or if stage is not defined, put in first stage
                  return topic.stage === stage.name || (!topic.stage && stage === stagesData[0]);
                })
                .map((topic) => ({
                  name: topic.name,
                  weight: topic.weight || 0,
                  subtopics: topic.subtopics || [],
                  searchTerm: "",
                  searchResults: [],
                  selectedSearchItems: [],
                }));
              
              initialTopicsByTab[stage.id.toString()] = stageTopics;
            });
          }
        }

        // Extract subjects from topics (since we're no longer using separate subjects array)
        if (result.success && result.data && Array.isArray(result.data.topics)) {
          const topics = result.data.topics;
          const subjectNames = topics.map(topic => topic.name);
          console.log("Extracted subject names from topics:", subjectNames);
          setSubjects(subjectNames);
        } else {
          console.log("No topics data found in API response");
          setSubjects([]);
        }
        
        setTopicsByTab(initialTopicsByTab);
      } else {
        console.warn("No stages found in overviewdata");
        message.error("No stages found for this competition");
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      message.error("Failed to fetch syllabus. Please try again.");
    }
  };

  useEffect(() => {
    if (competitionId) {
      getsyllabus();
    }
  }, [competitionId]);

  // Update active tab when stages change
  useEffect(() => {
    if (stages.length > 0 && !activeTab) {
      setActiveTab(stages[0].id.toString());
    }
  }, [stages, activeTab]);

  // Handle clicking outside subject selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSubjectSelector && !event.target.closest('.subject-selector')) {
        setShowSubjectSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubjectSelector]);

  // Debug subjects state changes
  useEffect(() => {
    console.log("Subjects state changed:", subjects);
    // Show topics field when any subject is selected
    setShowTopicsField(subjects.length > 0);
  }, [subjects]);

  // Check if save button should be active
  const canSave = () => {
    // Must have stages
    if (stages.length === 0) return false;
    
    // Must have subjects selected
    if (subjects.length === 0) return false;
    
    // If user has Academic subjects, they must add topics to all stages
    const hasAcademicSubjects = subjects.some(subjectName => 
      subjectCategories["Academic"].includes(subjectName)
    );
    
    if (hasAcademicSubjects) {
      // All stages must have topics
      return stages.every(stage => {
        const stageTopics = topicsByTab[stage.id.toString()] || [];
        return stageTopics.length > 0;
      });
    } else {
      // For Extra-curricular or Others only, just having subjects is enough
      return true;
    }
  };

  return (
    <div style={{ width: "100%", position: "relative", paddingBottom: "100px" }}>
      <style>{spinnerStyle}</style>
      <Card
        style={{
          width: "100%",
          margin: "0",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
        bodyStyle={{
          padding: "0"
        }}
      >
        {stages.length > 0 && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: "32px" }}
          />
        )}

        <Title
          level={2}
          style={{
            marginBottom: "32px",
            marginTop: "8px",
            fontWeight: "600",
            fontSize: "24px",
            color: "#000"
          }}
        >
          Syllabus
        </Title>

        {stages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text>No stages found for this competition. Please add stages first.</Text>
          </div>
        ) : (
          <Form layout="vertical" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Subjects Field */}
            <Row align="middle" style={{ marginBottom: "24px", width: "100%" }}>
              <Col span={24}>
               
                
                <Form.Item
                  label={
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>
                      Subjects<span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  style={{ marginBottom: "0" }}
                >
                  <div
                    className="subject-selector"
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s ease",
                      minHeight: "40px"
                    }}
                    onClick={toggleSubjectSelector}
                  >
                    <div style={{
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: subjects.length > 0 ? "#000" : "#999",
                      minHeight: "40px"
                    }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: subjects.length > 0 ? "500" : "normal"
                      }}>
                        {subjects.length > 0
                          ? `${subjects.length} subject(s) selected - Click to modify`
                          : "Click here to Select Subjects"
                        }
                      </span>
                      <DownOutlined style={{
                        color: "#999",
                        fontSize: "12px"
                      }} />
                    </div>
                    
                    {showSubjectSelector && (
                      <div 
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          right: 0,
                          backgroundColor: "#fff",
                          border: "1px solid #d9d9d9",
                          borderRadius: "6px",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                          zIndex: 1000,
                          maxHeight: "360px",
                          overflow: "hidden",
                          marginTop: "4px"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{
                          display: "flex",
                          borderBottom: "1px solid #f0f0f0"
                        }}>
                          {/* Left Column - Categories */}
                          <div style={{
                            width: "40%",
                            borderRight: "1px solid #f0f0f0",
                            backgroundColor: "#fafafa"
                          }}>
                            {Object.keys(subjectCategories).map((category) => (
                              <div
                                key={category}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategorySelect(category);
                                }}
                                style={{
                                  padding: "12px 16px",
                                  cursor: "pointer",
                                  backgroundColor: selectedCategory === category ? "#e6f7ff" : "transparent",
                                  borderBottom: "1px solid #f0f0f0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <span style={{
                                  color: selectedCategory === category ? "#1890ff" : "#000",
                                  fontWeight: selectedCategory === category ? "500" : "normal"
                                }}>
                                  {category}
                                </span>
                                <DownOutlined style={{ 
                                  color: "#666",
                                  transform: "rotate(-90deg)",
                                  fontSize: "12px"
                                }} />
                              </div>
                            ))}
                          </div>
                          
                          {/* Right Column - Subjects */}
                          <div style={{
                            width: "60%",
                            maxHeight: "350px",
                            overflowY: "auto"
                          }}>
                            {subjectCategories[selectedCategory]?.map((subject) => (
                              <div
                                key={subject}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubjectToggle(subject);
                                }}
                                style={{
                                  padding: "12px 16px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f0f0f0",
                                  backgroundColor: subjects.includes(subject) ? "#f6ffed" : "transparent",
                                  display: "flex",
                                  alignItems: "center"
                                }}
                              >
                                <div style={{
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid #d9d9d9",
                                  borderRadius: "3px",
                                  marginRight: "12px",
                                  backgroundColor: subjects.includes(subject) ? "#52c41a" : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}>
                                  {subjects.includes(subject) && (
                                    <span style={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                                  )}
                                </div>
                                <span style={{
                                  color: subjects.includes(subject) ? "#52c41a" : "#000"
                                }}>
                                  {subject}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Subjects Display */}
                  {subjects.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <Space wrap size={[8, 8]}>
                        {subjects.map((subject, index) => (
                          <Tag
                            key={index}
                            closable
                            onClose={() => handleSubjectRemove(subject)}
                            style={{
                              fontSize: "13px",
                              padding: "6px 12px",
                              border: "1px solid #52c41a",
                              borderRadius: "4px",
                              color: "#52c41a",
                              backgroundColor: "#f6ffed",
                              marginBottom: "4px"
                            }}
                          >
                            {subject}
                          </Tag>
                        ))}
                      </Space>
                      {/* Auto-save indicator */}
                      {autoSaveInProgress && (
                        <div style={{ 
                          marginTop: "8px", 
                          fontSize: "12px", 
                          color: "#1890ff",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <div style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid #1890ff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                          }}></div>
                          Auto-saving subjects...
                        </div>
                      )}
                    </div>
                  )}
                </Form.Item>
              </Col>
            </Row>

            {/* Topics Field - Only show when subjects are selected */}
            {showTopicsField && (
              <>
                <Row align="middle" style={{ marginBottom: "24px", width: "100%", marginTop: "24px" }}>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>
                          Topics<span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select All Topics"
                        style={{
                          width: "100%"
                        }}
                        suffixIcon={<DownOutlined style={{ color: "#999" }} />}
                        size="middle"
                        value={[]}
                        onChange={(values) => {
                          // Add all selected topics
                          values.forEach(topic => handleTopicSelect(topic));
                        }}
                        disabled={availableTopics.length === 0}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 10000 }}
                        showArrow
                      >
                        {availableTopics.length > 0 ? (
                          availableTopics.map((topic, index) => (
                            <Option key={index} value={topic}>
                              {topic}
                            </Option>
                          ))
                        ) : (
                          <Option value="" disabled>
                            Please select subjects first to see topics
                          </Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {(topicsByTab[activeTab] || []).length > 0 && (
              <div style={{ marginBottom: "24px", marginTop: "24px" }}>
                {(topicsByTab[activeTab] || []).map((topic, index) => (
                  <div key={index} style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #d9d9d9",
                        borderRadius: expandedTopics.includes(index) ? "6px 6px 0 0" : "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                        <Text style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#000"
                        }}>
                          Topic {index + 1}:
                        </Text>
                        <Text style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#52c41a"
                        }}>
                          {topic.name}
                        </Text>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Button
                          type="text"
                          size="small"
                          icon={
                            expandedTopics.includes(index) ? (
                              <CaretUpOutlined style={{ fontSize: "14px" }} />
                            ) : (
                              <CaretDownOutlined style={{ fontSize: "14px" }} />
                            )
                          }
                          onClick={() => toggleTopicExpansion(index)}
                          style={{ color: "#666", padding: "4px" }}
                        />

                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined style={{ fontSize: "14px" }} />}
                          onClick={() => handleTopicRemove(index)}
                          style={{ color: "#666", padding: "4px" }}
                        />

                        {showWeightage && (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginLeft: "12px"
                          }}>
                            <Input
                              value={topic.weight}
                              onChange={(e) =>
                                handleWeightChange(index, e.target.value)
                              }
                              style={{
                                width: "70px",
                                textAlign: "center",
                                borderRadius: "4px"
                              }}
                              size="small"
                              placeholder="0"
                            />
                            <Text style={{ fontSize: "14px", color: "#666" }}>%</Text>
                          </div>
                        )}
                      </div>
                    </div>

                    {expandedTopics.includes(index) && (
                      <div
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #d9d9d9",
                          borderTop: "none",
                          borderRadius: "0 0 6px 6px",
                          padding: "16px"
                        }}
                      >
                        <div style={{ marginBottom: "16px" }}>
                          <Input
                            placeholder="Search subtopics..."
                            prefix={<SearchOutlined style={{ color: "#999" }} />}
                            value={topic.searchTerm}
                            onChange={(e) =>
                              handleSearchChange(index, e.target.value)
                            }
                            size="middle"
                            style={{
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px"
                            }}
                            allowClear
                          />
                        </div>

                        {topic.searchResults.length > 0 && (
                          <div
                            style={{
                              marginBottom: "16px",
                              maxHeight: "200px",
                              overflowY: "auto",
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px",
                              backgroundColor: "#fff"
                            }}
                          >
                            <List
                              size="small"
                              dataSource={topic.searchResults}
                              renderItem={(item) => (
                                <List.Item 
                                  style={{
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0"
                                  }}
                                  onClick={() => {
                                    if (!topic.subtopics.includes(item)) {
                                      const newTopics = [...(topicsByTab[activeTab] || [])];
                                      newTopics[index].subtopics.push(item);
                                      newTopics[index].searchTerm = "";
                                      newTopics[index].searchResults = [];
                                      setTopicsByTab({
                                        ...topicsByTab,
                                        [activeTab]: newTopics,
                                      });
                                    }
                                  }}
                                >
                                  <Text>{item}</Text>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}

                        {topic.subtopics.length > 0 && (
                          <div style={{ marginTop: "16px" }}>
                            <Space wrap size={[8, 8]}>
                              {topic.subtopics.map((subtopic, subIndex) => (
                                <Tag
                                  key={subIndex}
                                  closable
                                  onClose={() => removeSubtopic(index, subIndex)}
                                  style={{
                                    fontSize: "13px",
                                    padding: "6px 12px",
                                    border: "1px solid #52c41a",
                                    borderRadius: "4px",
                                    color: "#52c41a",
                                    backgroundColor: "#f6ffed",
                                    marginBottom: "4px"
                                  }}
                                >
                                  {subtopic}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Weightage Controls */}
            {(topicsByTab[activeTab] || []).length > 0 && (
              <div
                style={{
                  marginBottom: "24px",
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                  border: "1px solid #e8e8e8"
                }}
              >
                {showWeightage && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Text style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>
                      Total Weightage:
                    </Text>
                    <Text style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: getWeightageTotal() === 100 ? "#52c41a" : getWeightageTotal() > 100 ? "#ff4d4f" : "#faad14"
                    }}>
                      {getWeightageTotal()}%
                    </Text>
                    {getWeightageTotal() !== 100 && (
                      <Text style={{ fontSize: "12px", color: "#999", marginLeft: "8px" }}>
                        (should be 100%)
                      </Text>
                    )}
                  </div>
                )}
                {!showWeightage && <div></div>}
                <div>
                  {!showWeightage ? (
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={addWeightage}
                      style={{
                        padding: "4px 8px",
                        color: "#1890ff",
                        fontSize: "14px",
                        fontWeight: "500",
                        height: "auto"
                      }}
                    >
                      Add Weightage
                    </Button>
                  ) : (
                    <Button
                      type="link"
                      icon={<CloseOutlined />}
                      onClick={removeWeightage}
                      style={{
                        padding: "4px 8px",
                        color: "#ff4d4f",
                        fontSize: "14px",
                        fontWeight: "500",
                        height: "auto"
                      }}
                    >
                      Remove Weightage
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Spacer for sticky button */}
            <div style={{ height: "80px" }}></div>
          </Form>
        )}
      </Card>
      
      {/* Sticky Save Button - outside Card but inside wrapper */}
      {stages.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #e8e8e8",
          padding: "16px 24px",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <Button
            type="primary"
            size="large"
            onClick={saveSyllabus}
            loading={loading}
            disabled={!canSave()}
            style={{
              backgroundColor: canSave() ? "#52c41a" : "#d9d9d9",
              borderColor: canSave() ? "#52c41a" : "#d9d9d9",
              color: "#fff",
              fontWeight: "600",
              fontSize: "15px",
              height: "40px",
              padding: "0 32px",
              borderRadius: "6px",
              boxShadow: canSave() ? "0 2px 8px rgba(82, 196, 26, 0.25)" : "none",
              cursor: canSave() ? "pointer" : "not-allowed"
            }}
          >
            Save and Continue
          </Button>
        </div>
      )}
    </div>
  );
};


export default OSyllabus;
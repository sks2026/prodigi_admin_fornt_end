import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button, Input, Select, Tabs, Card, Row, Col, Typography, message } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { CiCirclePlus } from "react-icons/ci";
import { useParams } from "react-router-dom";
import JoditEditor from "jodit-react";

const { Title, Text } = Typography;
const { Option } = Select;

const OPattern = ({ fun, ID }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [patternsByTab, setPatternsByTab] = useState({});
  const [stages, setStages] = useState([]); // New state for stages
  const [rulesByTab, setRulesByTab] = useState({}); // Changed to store rules per stage
  const [isAcademic, setIsAcademic] = useState(false); // New state to check if subjects are academic
  
  const editor = useRef(null);
  
  // Use ID from props if available, otherwise use id from params
  const competitionId = ID || id;

  // JoditEditor configuration
  const editorConfig = useMemo(() => ({
    placeholder: "Type your competition rules here...",
    height: 300,
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
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
    // Prevent refresh issues
    events: {
      beforeInit: function(editor) {
        // Custom initialization if needed
      }
    },
    // Disable auto-save to prevent refresh
    saveModeInStorage: false,
    // Prevent unnecessary re-renders
    // (keys defined above)
  }), []);

  // JoditEditor change handler
  const handleRulesChange = useCallback((newContent) => {
    console.log('Rules content changed for tab:', activeTab, newContent);
    
    const newRulesByTab = {
      ...rulesByTab,
      [activeTab]: newContent
    };
    
    setRulesByTab(newRulesByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab,
        rulesByTab: newRulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  }, [competitionId, patternsByTab, rulesByTab, activeTab]);

  // Check if subjects are academic
  const getsyllabus = async () => {
    if (!competitionId) return;

    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      const response = await fetch(
        `https://api.prodigiedu.com/api/competitions/getsyllabus/${competitionId}`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched syllabus:", result);

      // Check if subjects are academic
      if (result.success && result.data && Array.isArray(result.data.topics)) {
        const topics = result.data.topics;
        const academicSubjects = ["Maths", "English", "Physics", "Chemistry", "Environmental Studies", "History", "General Knowledge", "Computer Science", "Biology", "Geography", "Economics", "Literature"];
        
        const hasAcademicSubjects = topics.some(topic => 
          academicSubjects.includes(topic.name)
        );
        
        setIsAcademic(hasAcademicSubjects);
        console.log("Is Academic:", hasAcademicSubjects);
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
    }
  };

  // Fetch pattern data when component mounts
  useEffect(() => {
    const getPattern = async () => {
      try {
        // Check localStorage first for saved pattern data
        const localKey = `competition_pattern_${competitionId}`;
        const savedPatternData = localStorage.getItem(localKey);
        
        if (savedPatternData) {
          try {
            const parsedData = JSON.parse(savedPatternData);
            console.log("Loading saved pattern data from localStorage:", parsedData);
            
            // Check if saved data is not too old (24 hours)
            const isDataFresh = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000;
            
            if (isDataFresh && parsedData.patternsByTab) {
              setPatternsByTab(parsedData.patternsByTab);
              if (parsedData.rulesByTab) {
                setRulesByTab(parsedData.rulesByTab);
              }
              console.log("Restored pattern data from localStorage");
            }
          } catch (localError) {
            console.error("Error parsing localStorage data:", localError);
          }
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };

        const response = await fetch(`https://api.prodigiedu.com/api/competitions/getpattern/${competitionId}`, requestOptions);
        const result = await response.json();

        console.log("Fetched pattern:", result);

        // Extract stages from overviewdata
        if (result.overviewdata && Array.isArray(result.overviewdata.stages)) {
          const stagesData = result.overviewdata.stages;
          setStages(stagesData);
          
          // Initialize patternsByTab for each stage
          const initialPatternsByTab = {};
          stagesData.forEach((stage) => {
            initialPatternsByTab[stage.id.toString()] = [];
          });
          
          // Set the first stage as active tab if available
          if (stagesData.length > 0) {
            setActiveTab(stagesData[0].id.toString());
          }

          // Process existing pattern data if any
          if (response.ok && result.success && result.data && result.data.sections) {
            console.log(result.data.sections, "result.data.sections");

            // Group sections by stage if stage information is available
            const sectionsByStage = {};
            
            result.data.sections.forEach((section, index) => {
              const stageName = section.stage;
              const stageId = stagesData.find(stage => stage.name === stageName)?.id.toString();
              
              if (stageId) {
                if (!sectionsByStage[stageId]) {
                  sectionsByStage[stageId] = [];
                }
                
                sectionsByStage[stageId].push({
                  id: Date.now() + index,
                  name: section.sectionName || section.name,
                  formats: [{
                    id: Date.now() + index + 1,
                    format: section.format || "MCQ",
                    questions: section.questions ? section.questions.toString() : "",
                    marks: section.marksPerQuestion ? `+${section.marksPerQuestion}` : ""
                  }]
                });
              }
            });

            // Assign sections to their respective stages
            Object.keys(sectionsByStage).forEach(stageId => {
              initialPatternsByTab[stageId] = sectionsByStage[stageId];
            });

            // If no sections were assigned to stages, put them in the first stage
            if (Object.keys(sectionsByStage).length === 0 && stagesData.length > 0) {
              const firstStageId = stagesData[0].id.toString();
              initialPatternsByTab[firstStageId] = result.data.sections.map((section, index) => ({
                id: Date.now() + index,
                name: section.sectionName || section.name,
                formats: [{
                  id: Date.now() + index + 1,
                  format: section.format || "MCQ",
                  questions: section.questions ? section.questions.toString() : "",
                  marks: section.marksPerQuestion ? `+${section.marksPerQuestion}` : ""
                }]
              }));
            }
          }

          // Fetch existing rules data if available and assign to respective stages
          if (response.ok && result.success && result.data && result.data.sections) {
            const rulesDataByStage = {};
            result.data.sections.forEach((section) => {
              const stageName = section.stage;
              const stageId = stagesData.find(stage => stage.name === stageName)?.id.toString();
              
              if (stageId && section.rules) {
                // Store rules per stage (take first occurrence if multiple sections have rules)
                if (!rulesDataByStage[stageId]) {
                  rulesDataByStage[stageId] = section.rules;
                }
              }
            });
            
            setRulesByTab(rulesDataByStage);
            console.log("Fetched existing rules by stage:", rulesDataByStage);
          }
          
          // Always add at least one default section if no existing data or if existing data is empty
          if (stagesData.length > 0) {
            const firstStageId = stagesData[0].id.toString();
            if (!initialPatternsByTab[firstStageId] || initialPatternsByTab[firstStageId].length === 0) {
              const defaultSection = {
                id: Date.now(),
                name: "",
                formats: [
                  {
                    id: Date.now() + 1,
                    format: "",
                    questions: "",
                    marks: ""
                  }
                ]
              };
              initialPatternsByTab[firstStageId] = [defaultSection];
            }
          }
          
          setPatternsByTab(initialPatternsByTab);
        } else {
          console.warn("No stages found in overviewdata");
          message.error("No stages found for this competition");
        }
      } catch (error) {
        console.error('Error fetching pattern:', error);
        message.error('Failed to fetch pattern data.');
      }
    };

    if (competitionId) {
      getPattern();
      getsyllabus(); // Also check syllabus to determine if academic
    }
  }, [competitionId]); // Only depend on competitionId

  // Update active tab when stages change - separate useEffect to prevent loops
  useEffect(() => {
    if (stages.length > 0 && !activeTab) {
      setActiveTab(stages[0].id.toString());
    }
  }, [stages]); // Remove activeTab dependency to prevent infinite loops

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      name: "",
      formats: [
        {
          id: Date.now(),
          format: "",
          questions: "",
          marks: ""
        }
      ]
    };
    
    const newPatternsByTab = {
      ...patternsByTab,
      [activeTab]: [...(patternsByTab[activeTab] || []), newSection]
    };
    
    setPatternsByTab(newPatternsByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab: newPatternsByTab,
        rulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const removeSection = (sectionId) => {
    const newPatternsByTab = {
      ...patternsByTab,
      [activeTab]: (patternsByTab[activeTab] || []).filter(section => section.id !== sectionId)
    };
    
    setPatternsByTab(newPatternsByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab: newPatternsByTab,
        rulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const updateSection = (sectionId, field, value) => {
    const newPatternsByTab = {
      ...patternsByTab,
      [activeTab]: (patternsByTab[activeTab] || []).map(section =>
        section.id === sectionId
          ? { ...section, [field]: value }
          : section
      )
    };
    
    setPatternsByTab(newPatternsByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab: newPatternsByTab,
        rulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const addFormat = (sectionId) => {
    const newPatternsByTab = {
      ...patternsByTab,
      [activeTab]: (patternsByTab[activeTab] || []).map(section =>
        section.id === sectionId
          ? {
            ...section,
            formats: [
              ...section.formats,
              {
                id: Date.now(),
                format: "",
                questions: "",
                marks: ""
              }
            ]
          }
          : section
      )
    };
    
    setPatternsByTab(newPatternsByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab: newPatternsByTab,
        rulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const updateFormat = (sectionId, formatId, field, value) => {
    const newPatternsByTab = {
      ...patternsByTab,
      [activeTab]: (patternsByTab[activeTab] || []).map(section =>
        section.id === sectionId
          ? {
            ...section,
            formats: section.formats.map(format =>
              format.id === formatId
                ? { ...format, [field]: value }
                : format
            )
          }
          : section
      )
    };
    
    setPatternsByTab(newPatternsByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_pattern_${competitionId}`;
      const currentData = {
        patternsByTab: newPatternsByTab,
        rulesByTab,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const transformDataForAPI = () => {
    // Combine sections from all stages with complete data
    const allSections = [];
    
    console.log("Current rulesByTab value:", rulesByTab); // Debug log
    
    // Strip HTML to plain text for API
    const stripHtml = (html) => {
      if (!html) return "";
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };
    
    stages.forEach((stage) => {
      const stageId = stage.id.toString();
      const stagePatterns = patternsByTab[stageId] || [];
      const stageRules = rulesByTab[stageId] || ""; // Get rules specific to this stage
      
      console.log(`Stage ${stage.name} rules:`, stageRules);
      
      stagePatterns.forEach(section => {
        section.formats.forEach(format => {
          if (isAcademic) {
            allSections.push({
              name: section.name,
              format: format.format,
              questions: parseInt(format.questions) || 0,
              marksPerQuestion: format.marks.replace('+', '') || '0',
              stage: stage.name, // Add stage information
              rules: stageRules // Include HTML rules specific to this stage
            });
          } else {
            allSections.push({
              name: section.name,
              format: format.format,
              stage: stage.name, // Add stage information
              rules: stageRules // Include HTML rules specific to this stage
            });
          }
        });
      });
    });

    console.log("Final API data:", allSections); // Debug log

    return {
      sections: allSections
      // Removed separate rules field since it's now inside each section
    };
  };

  // Check if all stages have patterns for save button state
  const allStagesHavePatterns = stages.length > 0 && stages.every(stage => {
    const stagePatterns = patternsByTab[stage.id.toString()] || [];
    return stagePatterns.length > 0 && stagePatterns.every(section => 
      section.name.trim() && 
      section.formats.length > 0 && 
      section.formats.every(format => {
        if (isAcademic) {
          return format.format && format.questions && format.marks;
        } else {
          return format.format; // Only format is required for non-academic
        }
      })
    );
  });

  const savePattern = async () => {
    try {
      setLoading(true);

      // Check if all stages have at least one section
      const stagesWithoutPatterns = stages.filter(stage => {
        const stagePatterns = patternsByTab[stage.id.toString()] || [];
        return stagePatterns.length === 0;
      });

      if (stagesWithoutPatterns.length > 0) {
        const stageNames = stagesWithoutPatterns.map(stage => stage.name).join(', ');
        message.warning(
          `Please add at least one pattern section to the following stage(s): ${stageNames}`
        );
        return;
      }

      // Validate required fields for all stages
      const hasEmptyFields = Object.keys(patternsByTab).some(tab =>
        (patternsByTab[tab] || []).some(section =>
          !section.name.trim() ||
          section.formats.length === 0 ||
          section.formats.some(format => {
            if (isAcademic) {
              return !format.format || !format.questions || !format.marks;
            } else {
              return !format.format; // Only format is required for non-academic
            }
          })
        )
      );

      if (hasEmptyFields) {
        const requiredFields = isAcademic 
          ? 'Name, Format, Questions, Marks' 
          : 'Name, Format';
        message.error(`Please fill all required fields (${requiredFields}) in all pattern sections`);
        return;
      }

      const transformedData = transformDataForAPI();

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify(transformedData);

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch(`https://api.prodigiedu.com/api/competitions/updatepattern/${competitionId}`, requestOptions);

      if (response.ok) {
        const result = await response.text();
        console.log('Success:', result);
        
        // Save to localStorage for persistence
        const localKey = `competition_pattern_${competitionId}`;
        localStorage.setItem(localKey, JSON.stringify({
          patternsByTab,
          rulesByTab,
          timestamp: Date.now()
        }));
        
        message.success('Pattern saved successfully!');
        fun(3, competitionId);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving pattern:', error);
      message.error('Failed to save pattern. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create tab items dynamically based on stages
  const tabItems = stages.map((stage) => ({
    key: stage.id.toString(),
    label: stage.name,
  }));

  // Format options for the dropdown
  const formatOptions = [
    "Single-choice MCQ",
    "Games",
    "Submission",
    "Multiple-choice MCQ",
    "Fill in the Blanks",
    "True or False",
    "Knock-out",
    "Round-robin",
    "Subjective",
    "Numeric",
    "Buzzer",
    "Face-off",
    "Match the column",
    "Group discussion",
    "Comprehension",
    "Verbal",
    "Written",
    "Assignment",
    "Interview",
    "Presentation"
  ];

  // Debug log to verify formatOptions
  console.log('Format Options Available:', formatOptions.length);

  return (
    <div style={{ padding: '0', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Tabs Section */}
      {stages.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {stages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", backgroundColor: 'white', borderRadius: '8px' }}>
            <Text>No stages found for this competition. Please add stages first.</Text>
          </div>
        ) : (
          <>
            {/* Pattern Section */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '24px', fontWeight: '600' }}>Pattern</Title>
             

              {(patternsByTab[activeTab] || []).map((section, sectionIndex) => (
                <div key={section.id} style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '16px',
                  backgroundColor: '#fafafa'
                }}>
                  {/* Section Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <Text strong style={{ fontSize: '16px' }}>Section {sectionIndex + 1}</Text>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => removeSection(section.id)}
                      size="small"
                      style={{ color: '#999' }}
                    />
                  </div>

                  {/* Name Field */}
                  <div style={{ marginBottom: '20px' }}>
                    <Row align="middle" gutter={[16, 0]}>
                      <Col span={3}>
                        <Text strong>
                          Name<span style={{ color: 'red' }}>*</span>
                        </Text>
                      </Col>
                      <Col span={21}>
                        <Input
                          placeholder="Name of the Section"
                          value={section.name}
                          onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                          style={{ width: '300px' }}
                        />
                      </Col>
                    </Row>
                  </div>

                  {/* Format Fields */}
                  {section.formats.map((format, formatIndex) => (
                    <div key={format.id} style={{ marginBottom: '16px' }}>
                      <Row align="middle" gutter={[16, 0]}>
                        <Col span={3}>
                          <Text strong>
                            Format<span style={{ color: 'red' }}>*</span>
                          </Text>
                        </Col>
                        <Col span={5}>
                          <Select
                            placeholder="Select Format"
                            value={format.format || undefined}
                            onChange={(value) => {
                              console.log('Format selected:', value);
                              updateFormat(section.id, format.id, 'format', value);
                            }}
                            style={{ width: '100%' }}
                            suffixIcon={<div style={{ color: '#999' }}>▼</div>}
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto', zIndex: 1050 }}
                            getPopupContainer={trigger => trigger.parentElement}
                            onDropdownVisibleChange={(open) => {
                              if (open) {
                                console.log('Dropdown opened, showing', formatOptions.length, 'options');
                              }
                            }}
                          >
                            {formatOptions.map((option, index) => (
                              <Option key={`${option}-${index}`} value={option}>
                                {option}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        {isAcademic && (
                          <>
                            <Col span={3}>
                              <Text strong>
                                Questions<span style={{ color: 'red' }}>*</span>
                              </Text>
                            </Col>
                            <Col span={3}>
                              <Input
                                placeholder="Enter"
                                value={format.questions}
                                onChange={(e) => updateFormat(section.id, format.id, 'questions', e.target.value)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col span={3}>
                              <Text strong>
                                {formatIndex === 0 ? 'Marks' : 'Marks Per Question'}<span style={{ color: 'red' }}>*</span>
                              </Text>
                            </Col>
                            <Col span={4}>
                              <Input
                                placeholder="Enter"
                                value={format.marks}
                                onChange={(e) => updateFormat(section.id, format.id, 'marks', e.target.value)}
                                style={{ width: '100%' }}
                              />
                            </Col>
                          </>
                        )}
                      </Row>
                    </div>
                  ))}

                  {/* Add Format Button */}
                  <div style={{ marginTop: '16px', marginLeft: '120px' }}>
                    <Button
                      type="link"
                      icon={<CiCirclePlus className="fs-4" />}
                      onClick={() => addFormat(section.id)}
                      style={{ padding: '0', color: '#1890ff', fontSize: '14px' }}
                    >
                      Add Format
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add Section Button */}
              <Button
                type="link"
                icon={<CiCirclePlus className="fs-4" />}
                onClick={addSection}
                style={{ padding: '0', color: '#1890ff', fontSize: '14px', marginTop: '8px' }}
              >
                Add Section
              </Button>
            </div>

                        {/* Rules Section */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Title level={4} style={{ marginBottom: '24px', fontWeight: '600' }}>Rules</Title>
             
             
              
              {/* Main Rules Input - JoditEditor */}
              <div style={{ marginBottom: '16px' }}>
                                 <div style={{ marginTop: '8px' }}>
                   <JoditEditor
                     key={`rules-editor-${competitionId}-${activeTab}`}
                     ref={editor}
                     value={rulesByTab[activeTab] || ""}
                     config={editorConfig}
                     onChange={handleRulesChange}
                     tabIndex={1}
                   />
                 </div>
                <div style={{ 
                  marginTop: '8px', 
                  textAlign: 'right', 
                  fontSize: '12px', 
                  color: '#666' 
                }}>
                  {(rulesByTab[activeTab] || "").replace(/<[^>]*>/g, '').length} characters
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'white',
        padding: '16px 24px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000
      }}>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={savePattern}
          style={{
            backgroundColor: allStagesHavePatterns ? '#4CAF50' : '#d9d9d9',
            color: allStagesHavePatterns ? '#fff' : '#666',
            minWidth: '160px',
            height: '40px',
            fontWeight: '500'
          }}
          disabled={!allStagesHavePatterns}
        >
          Save and Continue
        </Button>
      </div>
    </div>
  );
};

export default OPattern;
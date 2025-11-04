import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Tabs,
  Select,
  Button,
  Collapse,
  Input,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  message,
  Spin
} from "antd";
import {
  DownOutlined,
  CloseOutlined,
  CaretRightOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useParams } from "react-router-dom";

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

  const OEligibility = ({ fun, ID }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("");
  const [activeKeys, setActiveKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataByTab, setDataByTab] = useState({});
  const [stages, setStages] = useState([]);
  const [additionalForms, setAdditionalForms] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  // Debug: Log component props and state
  useEffect(() => {
    console.log('OEligibility component mounted with:', { fun, ID, id, competitionId: ID || id });
  }, [fun, ID, id]);

  // Debug: Log additionalForms state changes
  useEffect(() => {
    console.log('AdditionalForms state changed:', additionalForms);
  }, [additionalForms]);

  const competitionId = ID || id;

  const criteriaOptions = [
    { value: 'current_grade', label: 'Current Grade' },
    { value: 'marks_last_year', label: 'Marks in last academic year' },
    { value: 'age', label: 'Age' },
    { value: 'rank_previous_round', label: 'Rank in previous round' },
    { value: 'team_size', label: 'Team Size' },
    { value: 'participation_same_school', label: 'Participation from same school' }
  ];

  const studentDetailOptions = [
    "Student's Name",
    "Student's Age",
    "School Name",
    "Parent's / Guardian's Name",
    "Contact number",
    "Email ID",
    "City",
    "Address",
    "Roll number",
    "Grade",
    "Section",
    "Birth Date",
    "Age Group"
  ];

  const schoolDetailOptions = [
    "School ",
    "Address",
    "Contact Number",
    "City",
    "Type of School",
    "POC Name",
    "Email ID",
    "Student",
    "Additional"
  ];

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch competition data and stages when component mounts
  useEffect(() => {
    const getCompetitionData = async () => {
      if (!competitionId) return;

      try {
        // Check localStorage first for saved eligibility data
        const localKey = `competition_eligibility_${competitionId}`;
        const savedEligibilityData = localStorage.getItem(localKey);
        
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
        console.log("Fetched competition data:", result);

        if (result.overviewdata && Array.isArray(result.overviewdata.stages)) {
          const stagesData = result.overviewdata.stages;
          setStages(stagesData);
          
          // Process saved data after we have the stages
          if (savedEligibilityData) {
            try {
              const parsedData = JSON.parse(savedEligibilityData);
              console.log("Loading saved eligibility data from localStorage:", parsedData);
              
              // Check if saved data is not too old (24 hours)
              const isDataFresh = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000;
              
              if (isDataFresh && parsedData.dataByTab && parsedData.additionalForms) {
                // Merge saved data with any new stages that might have been added
                const mergedDataByTab = { ...parsedData.dataByTab };
                
                // Check if there are new stages that don't have saved data
                stagesData.forEach((stage) => {
                  const stageId = stage.id.toString();
                  if (!mergedDataByTab[stageId]) {
                    // Initialize new stage with default data
                    mergedDataByTab[stageId] = {
                      selectedCriteria: [],
                      criteriaData: {},
                      studentDetails: ["Student's Name", "Parent's / Guardian's Name", "Contact number", "Email ID"],
                      schoolDetails: ["School Name", "Address", "Contact Number", "City"]
                    };
                  }
                });
                
                setDataByTab(mergedDataByTab);
                setAdditionalForms(parsedData.additionalForms || []);
                console.log("Restored eligibility data from localStorage with merged stages");
                console.log("Restored additionalForms:", parsedData.additionalForms);
              } else {
                // Initialize with default data if saved data is invalid or old
                initializeDefaultData(stagesData);
              }
            } catch (localError) {
              console.error("Error parsing localStorage data:", localError);
              // Initialize with default data if parsing fails
              initializeDefaultData(stagesData);
            }
          } else {
            // No saved data, initialize with defaults
            initializeDefaultData(stagesData);
          }
          
          // Set active tab
          if (stagesData.length > 0 && !activeTab) {
            setActiveTab(stagesData[0].id.toString());
          }
        } else {
          console.warn("No stages found in overviewdata");
          message.error("No stages found for this competition");
        }
      } catch (error) {
        console.error("Error fetching competition data:", error);
        message.error("Failed to fetch competition data.");
      }
    };

    // Helper function to initialize default data
    const initializeDefaultData = (stagesData) => {
      const initialDataByTab = {};
      stagesData.forEach((stage) => {
        initialDataByTab[stage.id.toString()] = {
          selectedCriteria: [],
          criteriaData: {},
          studentDetails: ["Student's Name", "Parent's / Guardian's Name", "Contact number", "Email ID"],
          schoolDetails: ["School Name", "Address", "Contact Number", "City"]
        };
      });
      setDataByTab(initialDataByTab);
      setAdditionalForms([]);
    };

    getCompetitionData();
  }, [competitionId]);

  // Update active tab when stages change and ensure localStorage is up to date
  useEffect(() => {
    if (stages.length > 0 && !activeTab) {
      setActiveTab(stages[0].id.toString());
    }
    
    // Update localStorage if stages have changed and we have existing data
    if (stages.length > 0 && competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const savedData = localStorage.getItem(localKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.dataByTab) {
            // Check if we need to add new stages to saved data
            let needsUpdate = false;
            const updatedDataByTab = { ...parsedData.dataByTab };
            
            stages.forEach((stage) => {
              const stageId = stage.id.toString();
              if (!updatedDataByTab[stageId]) {
                updatedDataByTab[stageId] = {
                  selectedCriteria: [],
                  criteriaData: {},
                  studentDetails: ["Student's Name", "Parent's / Guardian's Name", "Contact number", "Email ID"],
                  schoolDetails: ["School Name", "Address", "Contact Number", "City"]
                };
                needsUpdate = true;
              }
            });
            
            // Update localStorage if new stages were added
            if (needsUpdate) {
              localStorage.setItem(localKey, JSON.stringify({
                ...parsedData,
                dataByTab: updatedDataByTab,
                timestamp: Date.now()
              }));
              console.log("Updated localStorage with new stages");
            }
          }
        } catch (error) {
          console.error("Error updating localStorage with new stages:", error);
        }
      }
    }
    
    // Debug: Log current localStorage data
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const savedData = localStorage.getItem(localKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('Current localStorage data:', parsedData);
          console.log('Additional forms in localStorage:', parsedData.additionalForms);
        } catch (error) {
          console.error('Error parsing localStorage for debug:', error);
        }
      }
    }
  }, [stages, activeTab, competitionId]);

  // Debug: Log additionalForms and activeTab changes
  useEffect(() => {
    console.log('AdditionalForms state changed:', additionalForms);
    console.log('ActiveTab changed to:', activeTab);
    if (activeTab) {
      const currentStageForms = additionalForms.filter(form => form.stage === activeTab);
      console.log('Current stage forms for activeTab:', activeTab, currentStageForms);
    }
  }, [additionalForms, activeTab]);

  const allStagesHaveData = useMemo(() =>
    stages.length > 0 && stages.every(stage => {
      const stageData = dataByTab[stage.id.toString()];
      return stageData && stageData.studentDetails.length > 0;
    }), [stages, dataByTab]
  );

  const additionalFormsValid = useMemo(() =>
    additionalForms.every(form => {
      if (!form.name.trim() || !form.type) return false;

      if (form.type === "Date") {
        const settings = form.settings || {};
        if (settings.minDate && settings.maxDate && new Date(settings.minDate) > new Date(settings.maxDate)) {
          return false;
        }
      }



      return true;
    }), [additionalForms]
  );

  const saveEligibilityData = async () => {
    setLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const stagesWithoutData = stages.filter(stage => {
        const stageData = dataByTab[stage.id.toString()];
        return !stageData || stageData.studentDetails.length === 0;
      });

      if (stagesWithoutData.length > 0) {
        const stageNames = stagesWithoutData.map(stage => stage.name).join(', ');
        message.warning(
          `Please select at least one student detail in the following stage(s): ${stageNames}`
        );
        return;
      }

      const eligibility = [];

      stages.forEach((stage) => {
        const stageData = dataByTab[stage.id.toString()];
        if (stageData && stageData.selectedCriteria.length > 0) {
          stageData.selectedCriteria.forEach(criteria => {
            const criteriaLabel = criteriaOptions.find(opt => opt.value === criteria)?.label;
            const data = stageData.criteriaData[criteria];

            let requirement = "";
            if (data?.min && data?.max) {
              requirement = `Range: ${data.min} to ${data.max}`;
            } else if (data?.min) {
              requirement = `Minimum: ${data.min}`;
            } else if (data?.max) {
              requirement = `Maximum: ${data.max}`;
            } else {
              requirement = `${criteriaLabel} criteria applies`;
            }

            eligibility.push({
              title: criteriaLabel,
              requirement: requirement,
              stage: stage.name
            });
          });
        }
      });

      // Optimized data collection
      const studentDetails = [];
      const schoolDetails = [];
      
      stages.forEach(stage => {
        const stageData = dataByTab[stage.id.toString()];
        if (stageData?.studentDetails) {
          studentDetails.push(...stageData.studentDetails);
        }
        if (stageData?.schoolDetails) {
          schoolDetails.push(...stageData.schoolDetails);
        }
      });
      
      // Remove duplicates efficiently
      const uniqueStudentDetails = [...new Set(studentDetails)];
      const uniqueSchoolDetails = [...new Set(schoolDetails)];

      // Quick validation
      if (!Array.isArray(uniqueStudentDetails) || !Array.isArray(uniqueSchoolDetails)) {
        console.error('Data type error:', { uniqueStudentDetails, uniqueSchoolDetails });
        throw new Error('Invalid data types for studentDetails or schoolDetails');
      }

      // Ensure arrays are always valid with fallback
      let finalStudentDetails = Array.isArray(uniqueStudentDetails) && uniqueStudentDetails.length > 0 ? [...uniqueStudentDetails] : [];
      let finalSchoolDetails = Array.isArray(uniqueSchoolDetails) && uniqueSchoolDetails.length > 0 ? [...uniqueSchoolDetails] : [];
      
      // Force empty arrays if still invalid
      if (!Array.isArray(finalStudentDetails)) {
        console.warn('StudentDetails was not an array, forcing to empty array');
        finalStudentDetails = [];
      }
      if (!Array.isArray(finalSchoolDetails)) {
        console.warn('SchoolDetails was not an array, forcing to empty array');
        finalSchoolDetails = [];
      }
      
      // Final array validation
      if (!Array.isArray(finalStudentDetails) || !Array.isArray(finalSchoolDetails)) {
        console.error('Array validation failed after processing');
        throw new Error('Failed to create valid arrays for StudentDetails and SchoolDetails');
      }
      
      // Additional safety - ensure we have at least empty arrays
      if (!finalStudentDetails || finalStudentDetails.length === 0) {
        finalStudentDetails = [];
      }
      if (!finalSchoolDetails || finalSchoolDetails.length === 0) {
        finalSchoolDetails = [];
      }

      // Create the correct data structure as per API requirements
      const formattedData = {
        eligibility: [{
          criteria: eligibility.map(criteria => ({
            title: criteria.title,
            requirement: criteria.requirement,
            stage: criteria.stage
          })),
          additionalDetails: additionalForms.filter(form => form.name.trim() && form.type)
        }],
        StudentInformation: {
          StudentDetails: finalStudentDetails,
          SchoolDetails: finalSchoolDetails
        }
      };

      // Enhanced debugging and validation
      console.log('Raw studentDetails:', uniqueStudentDetails);
      console.log('Raw schoolDetails:', uniqueSchoolDetails);
      console.log('Final formatted data structure:', formattedData);
      
      // Validate the data structure
      const validateDataStructure = (data) => {
        return data.eligibility && 
               Array.isArray(data.eligibility) && 
               data.StudentInformation &&
               Array.isArray(data.StudentInformation.StudentDetails) && 
               Array.isArray(data.StudentInformation.SchoolDetails);
      };

      if (!validateDataStructure(formattedData)) {
        console.error('Data structure validation failed');
        throw new Error('Invalid data structure format');
      }

      // Final safety check - ensure arrays are valid
      if (!Array.isArray(formattedData.StudentInformation.StudentDetails)) {
        formattedData.StudentInformation.StudentDetails = [];
      }
      if (!Array.isArray(formattedData.StudentInformation.SchoolDetails)) {
        formattedData.StudentInformation.SchoolDetails = [];
      }
      
      console.log('After safety check - StudentDetails:', formattedData.StudentInformation.StudentDetails);
      console.log('After safety check - SchoolDetails:', formattedData.StudentInformation.SchoolDetails);
      
      // Final validation - ensure the data structure is exactly what we expect
      if (!validateDataStructure(formattedData)) {
        console.error('Final validation failed - forcing empty arrays');
        formattedData.StudentInformation.StudentDetails = [];
        formattedData.StudentInformation.SchoolDetails = [];
      }

      // Make API call with the correct data structure
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(formattedData),
        redirect: "follow"
      };

      const response = await fetch(`https://api.prodigiedu.com/api/competitions/eligibility/${competitionId}`, requestOptions);
      const result = await response.text();
      
      // Parse and validate API response
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
        console.log('API Response:', parsedResult);
        
        if (!parsedResult.success) {
          throw new Error(parsedResult.message || 'API request failed');
        }
      } catch (e) {
        console.error('API Response Error:', e);
        throw new Error(`API Error: ${e.message}`);
      }

      // Save to localStorage for persistence
      const localKey = `competition_eligibility_${competitionId}`;
      const dataToSave = {
        dataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      
      console.log('Saving to localStorage:', dataToSave);
      localStorage.setItem(localKey, JSON.stringify(dataToSave));
      
      message.success('Eligibility criteria saved successfully!');
      fun(4, competitionId);
    } catch (error) {
      console.error('API Error:', error);
      message.error('Failed to save eligibility criteria. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (values) => {
    const newDataByTab = {
      ...dataByTab,
      [activeTab]: {
        ...dataByTab[activeTab] || {
          selectedCriteria: [],
          criteriaData: {},
          studentDetails: [],
          schoolDetails: []
        },
        selectedCriteria: values
      }
    };
    
    setDataByTab(newDataByTab);
    setActiveKeys(values);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab: newDataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const handleCriteriaDataChange = (criteriaKey, field, value) => {
    const newDataByTab = {
      ...dataByTab,
      [activeTab]: {
        ...dataByTab[activeTab] || {
          selectedCriteria: [],
          criteriaData: {},
          studentDetails: [],
          schoolDetails: []
        },
        criteriaData: {
          ...dataByTab[activeTab]?.criteriaData || {},
          [criteriaKey]: {
            ...dataByTab[activeTab]?.criteriaData[criteriaKey] || {},
            [field]: value
          }
        }
      }
    };
    
    setDataByTab(newDataByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab: newDataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const removeCriteria = (criteriaToRemove) => {
    const currentTabData = dataByTab[activeTab] || { selectedCriteria: [], criteriaData: {} };
    const newSelectedCriteria = currentTabData.selectedCriteria.filter(c => c !== criteriaToRemove);
    const newCriteriaData = { ...currentTabData.criteriaData };
    delete newCriteriaData[criteriaToRemove];

    const newDataByTab = {
      ...dataByTab,
      [activeTab]: {
        ...currentTabData,
        selectedCriteria: newSelectedCriteria,
        criteriaData: newCriteriaData
      }
    };

    setDataByTab(newDataByTab);
    setActiveKeys(newSelectedCriteria);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab: newDataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const handleStudentDetailsChange = (values) => {
    const newDataByTab = {
      ...dataByTab,
      [activeTab]: {
        ...dataByTab[activeTab] || {
          selectedCriteria: [],
          criteriaData: {},
          studentDetails: [],
          schoolDetails: []
        },
        studentDetails: values
      }
    };
    
    setDataByTab(newDataByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab: newDataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const handleSchoolDetailsChange = (values) => {
    const newDataByTab = {
      ...dataByTab,
      [activeTab]: {
        ...dataByTab[activeTab] || {
          selectedCriteria: [],
          criteriaData: {},
          studentDetails: [],
          schoolDetails: []
        },
        schoolDetails: values
      }
    };
    
    setDataByTab(newDataByTab);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab: newDataByTab,
        additionalForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
    }
  };

  const addAdditionalForm = useCallback(() => {
    if (!activeTab) {
      message.warning('Please select a stage first');
      return;
    }
    
    const newFormId = Date.now();
    const newForm = {
      id: newFormId,
      name: "",
      type: "Short Answer",
      options: [],
      selectedOptions: [],
      stage: activeTab,
      settings: {
        wordLimit: 50
      }
    };
    
    console.log('Adding new form with stage:', activeTab, 'Form:', newForm);
    
    const newForms = [...additionalForms, newForm];
    setAdditionalForms(newForms);
    
    // Auto-save to localStorage
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const currentData = {
        dataByTab,
        additionalForms: newForms,
        timestamp: Date.now()
      };
      localStorage.setItem(localKey, JSON.stringify(currentData));
      console.log('Saved additional form to localStorage:', newForm);
      console.log('All additional forms after adding:', newForms);
    }
  }, [activeTab, additionalForms, dataByTab, competitionId]);

  const handleFormTypeChange = useCallback((formId, newType) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form => {
        if (form.id !== formId) return form;

        let newOptions = [...form.options];
        let newSettings = { ...form.settings };

        if (newType === "Multiple Choice" || newType === "Checkbox" || newType === "Drop Down") {
          newOptions = [];
        }

        if (newType === "Short Answer" || newType === "Date") {
          newOptions = [];
        }

        if (newType === "Short Answer") {
          newSettings = { wordLimit: 50 };
        } else if (newType === "Date") {
          newSettings = {
            minDate: new Date().toISOString().split('T')[0],
            maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0],
            allowFuture: true,
            allowPast: true
          };
        } else if (newType === "Drop Down") {
          newSettings = {
            allowMultiple: false,
            defaultOption: "",
            searchable: true
          };
        } else if (newType === "Multiple Choice") {
          newSettings = {
            allowMultiple: false,
            randomizeOptions: false,
            showCorrectAnswer: false
          };
        } else if (newType === "Checkbox") {
          newSettings = {
            allowMultiple: true,
            minSelection: 1,
            maxSelection: 5,
            requireAll: false
          };
        }

        return {
          ...form,
          type: newType,
          options: newOptions,
          settings: newSettings
        };
      });
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Updated form type in localStorage:', { formId, newType, newForms });
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

  const duplicateAdditionalForm = useCallback((formId) => {
    setAdditionalForms(prevForms => {
      const formToDuplicate = prevForms.find(form => form.id === formId);
      if (formToDuplicate) {
        const newFormId = Date.now();
        const duplicatedForm = {
          ...formToDuplicate,
          id: newFormId,
          name: `${formToDuplicate.name} (Copy)`,
          options: [...formToDuplicate.options],
          selectedOptions: [],
          settings: { ...formToDuplicate.settings }
        };
        
        const newForms = [...prevForms, duplicatedForm];
        
        // Auto-save to localStorage
        if (competitionId) {
          const localKey = `competition_eligibility_${competitionId}`;
          const currentData = {
            dataByTab,
            additionalForms: newForms,
            timestamp: Date.now()
          };
          localStorage.setItem(localKey, JSON.stringify(currentData));
          console.log('Duplicated form in localStorage:', duplicatedForm);
        }
        
        return newForms;
      }
      return prevForms;
    });
  }, [competitionId, dataByTab]);

  const removeAdditionalForm = useCallback((formId) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.filter(form => form.id !== formId);
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Removed form from localStorage:', formId, newForms);
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

  const updateAdditionalForm = useCallback((formId, field, value) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId ? { ...form, [field]: value } : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Updated additional form in localStorage:', { formId, field, value, newForms });
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

  const updateFormSettings = useCallback((formId, settingKey, value) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId ? {
          ...form,
          settings: {
            ...form.settings,
            [settingKey]: value
          }
        } : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Updated form settings in localStorage:', { formId, settingKey, value, newForms });
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

  const addOptionToForm = useCallback((formId) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId
          ? { ...form, options: [...form.options, `Option ${form.options.length + 1}`] }
          : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Added option to form in localStorage:', formId, newForms);
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

    const updateOptionInForm = useCallback((formId, optionIndex, value) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId
          ? {
            ...form,
            options: form.options.map((option, index) =>
              index === optionIndex ? value : option
            )
          }
          : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Updated option in form in localStorage:', formId, optionIndex, value, newForms);
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

    const removeOptionInForm = useCallback((formId, optionIndex) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId
          ? {
            ...form,
            options: form.options.filter((_, index) => index !== optionIndex)
          }
          : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Removed option from form in localStorage:', formId, optionIndex, newForms);
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

    const handleOptionSelection = useCallback((formId, optionIndex) => {
    setAdditionalForms(prevForms => {
      const newForms = prevForms.map(form =>
        form.id === formId
          ? {
            ...form,
            selectedOptions: (() => {
              if (form.type === "Checkbox") {
                const maxSelection = form.settings?.maxSelection || 5;
                if (form.selectedOptions?.includes(optionIndex)) {
                  return form.selectedOptions.filter(opt => opt !== optionIndex);
                } else {
                  const currentSelection = form.selectedOptions || [];
                  if (currentSelection.length < maxSelection) {
                    return [...currentSelection, optionIndex];
                  } else {
                    message.warning(`Maximum ${maxSelection} options can be selected`);
                    return currentSelection;
                  }
                }
              } else if (form.type === "Multiple Choice") {
                return [optionIndex];
              } else if (form.type === "Drop Down") {
                if (form.settings?.allowMultiple) {
                  if (form.selectedOptions?.includes(optionIndex)) {
                    return form.selectedOptions.filter(opt => opt !== optionIndex);
                  } else {
                    return [...(form.selectedOptions || []), optionIndex];
                  }
                } else {
                  return [optionIndex];
                }
              }
              return form.selectedOptions || [];
            })()
          }
          : form
      );
      
      // Auto-save to localStorage
      if (competitionId) {
        const localKey = `competition_eligibility_${competitionId}`;
        const currentData = {
          dataByTab,
          additionalForms: newForms,
          timestamp: Date.now()
        };
        localStorage.setItem(localKey, JSON.stringify(currentData));
        console.log('Updated option selection in localStorage:', formId, optionIndex, newForms);
      }
      
      return newForms;
    });
  }, [competitionId, dataByTab]);

  const renderCriteriaContent = useCallback((criteriaKey) => (
    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Min.</span>
        </div>
        <Input
          placeholder="Enter"
          value={dataByTab[activeTab]?.criteriaData[criteriaKey]?.min || ''}
          onChange={(e) => handleCriteriaDataChange(criteriaKey, 'min', e.target.value)}
        />
      </Col>
      <Col xs={24} sm={12}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Max.</span>
        </div>
        <Input
          placeholder="Enter"
          value={dataByTab[activeTab]?.criteriaData[criteriaKey]?.max || ''}
          onChange={(e) => handleCriteriaDataChange(criteriaKey, 'max', e.target.value)}
        />
      </Col>
    </Row>
  ), [activeTab, dataByTab, handleCriteriaDataChange]);

  const renderTabContent = useCallback(() => {
    const currentTabData = dataByTab[activeTab] || {
      selectedCriteria: [],
      criteriaData: {},
      studentDetails: ["Student's Name", "Parent's / Guardian's Name", "Contact number", "Email ID"],
      schoolDetails: ["School Name", "Address", "Contact Number", "City"]
    };

    // Filter forms for current stage at the top level
    const currentStageForms = additionalForms.filter(form => {
      console.log('Filtering form:', form.stage, '===', activeTab, '?', form.stage === activeTab);
      return form.stage === activeTab;
    });
    console.log('Current stage forms for activeTab:', activeTab, currentStageForms);
    console.log('All additionalForms:', additionalForms);
    console.log('ActiveTab type:', typeof activeTab, 'Value:', activeTab);
    
    // Debug: Check if forms are being filtered correctly
    if (additionalForms.length > 0) {
      console.log('Forms with stage info:', additionalForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })));
    }
    
    // Debug: Check if currentStageForms is empty
    if (currentStageForms.length === 0 && additionalForms.length > 0) {
      console.warn('No forms found for current stage. This might be a filtering issue.');
    }
    
    // Debug: Check if activeTab is valid
    if (!activeTab) {
      console.warn('ActiveTab is not set, cannot filter forms');
    }
    
    // Debug: Check if forms are being saved correctly
    if (competitionId) {
      const localKey = `competition_eligibility_${competitionId}`;
      const savedData = localStorage.getItem(localKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('Current localStorage additionalForms:', parsedData.additionalForms);
        } catch (error) {
          console.error('Error parsing localStorage for debug:', error);
        }
      }
    }
    
    // Debug: Check if forms are being loaded correctly
    console.log('Component state - additionalForms:', additionalForms);
    console.log('Component state - activeTab:', activeTab);
    console.log('Component state - dataByTab:', dataByTab);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms:', currentStageForms);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms length:', currentStageForms.length);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })));
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map length:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })).length);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map length:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })).length);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map length:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })).length);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map length:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })).length);
    
    // Debug: Check if forms are being rendered correctly
    console.log('About to render currentStageForms map length:', currentStageForms.map(f => ({ id: f.id, stage: f.stage, name: f.name })).length);

    return (
      <div className="tab-content" style={{
        height: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 40px 0px 40px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d4d4d4 #f1f1f1',
        paddingBottom: '80px'
      }}>
        <style>
          {`
            .tab-content::-webkit-scrollbar {
              width: 8px;
            }
            .tab-content::-webkit-scrollbar-track {
              background: #f1f1f1;
              borderRadius: 4px;
            }
            .tab-content::-webkit-scrollbar-thumb {
              background: #d4d4d4;
              borderRadius: 4px;
            }
            .tab-content::-webkit-scrollbar-thumb:hover {
              background: #bbb;
            }
            .eligibility-title, .student-info-title, .additional-details-title {
              font-size: 18px;
              font-weight: 600;
            }
            @media (max-width: 768px) {
              .eligibility-title, .student-info-title, .additional-details-title {
                font-size: 16px;
              }
            }
          `}
        </style>

        {/* Eligibility Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} className="eligibility-title">
            Eligibility
          </Title>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>Criteria (Optional)</span>
            </div>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select Criteria (Optional)"
              value={currentTabData.selectedCriteria}
              onChange={handleCriteriaChange}
              suffixIcon={<DownOutlined />}
              size="large"
            >
              {criteriaOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          {currentTabData.selectedCriteria.length > 0 && (
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              style={{ background: '#fff' }}
            >
              {currentTabData.selectedCriteria.map(criteria => {
                const criteriaLabel = criteriaOptions.find(opt => opt.value === criteria)?.label;
                return (
                  <Panel
                    key={criteria}
                    header={
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <span style={{ fontSize: windowWidth <= 768 ? '14px' : '16px' }}>
                          {criteriaLabel}
                        </span>
                        <CloseOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCriteria(criteria);
                          }}
                          style={{ color: '#999', fontSize: '12px' }}
                        />
                      </div>
                    }
                  >
                    {renderCriteriaContent(criteria)}
                  </Panel>
                );
              })}
            </Collapse>
          )}
        </div>

        {/* Student Information Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} className="student-info-title">
            Student Information
          </Title>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>
                Student Details<span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Information fields"
              onChange={(value) => {
                if (value && !currentTabData.studentDetails.includes(value)) {
                  handleStudentDetailsChange([...currentTabData.studentDetails, value]);
                }
              }}
              suffixIcon={<DownOutlined />}
              size="large"
            >
              {studentDetailOptions.filter(option => !currentTabData.studentDetails.includes(option)).map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxWidth: '100%',
              marginTop: '12px'
            }}>
              {currentTabData.studentDetails?.map(detail => (
                <Tag
                  key={detail}
                  closable
                  onClose={() => {
                    handleStudentDetailsChange(currentTabData.studentDetails.filter(d => d !== detail));
                  }}
                  style={{
                    background: '#f0f9f0',
                    border: '1px solid #95de64',
                    color: '#52c41a',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                    margin: '2px'
                  }}
                >
                  {detail}
                </Tag>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>School Details</span>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Information fields"
              onChange={(value) => {
                if (value && !currentTabData.schoolDetails.includes(value)) {
                  handleSchoolDetailsChange([...currentTabData.schoolDetails, value]);
                }
              }}
              suffixIcon={<DownOutlined />}
              size="large"
            >
              {schoolDetailOptions.filter(option => !currentTabData.schoolDetails.includes(option)).map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxWidth: '100%',
              marginTop: '12px'
            }}>
              {currentTabData.schoolDetails.map(detail => (
                <Tag
                  key={detail}
                  closable
                  onClose={() => {
                    handleSchoolDetailsChange(currentTabData.schoolDetails.filter(d => d !== detail));
                  }}
                  style={{
                    background: '#f0f9f0',
                    border: '1px solid #95de64',
                    color: '#52c41a',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: windowWidth <= 768 ? '12px' : '14px',
                    margin: '2px'
                  }}
                >
                  {detail}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} className="additional-details-title">
            Additional Details
          </Title>

          {currentStageForms.length > 0 ? currentStageForms.map((form, index) => (
            <div key={form.id} style={{
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <Text strong style={{ fontSize: '16px' }}>Additional Detail {index + 1}</Text>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Row align="middle" gutter={[16, 0]}>
                  <Col span={12}>
                    <Input
                      placeholder="Enter Question"
                      value={form.name}
                      onChange={(e) => updateAdditionalForm(form.id, 'name', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                                          <Select
                        placeholder="Select Type"
                        value={form.type}
                        onChange={(value) => handleFormTypeChange(form.id, value)}
                        style={{ width: '100%' }}
                        showSearch={false}
                        filterOption={false}
                        notFoundContent={null}
                        loading={false}
                      >
                        <Option value="Short Answer">Short Answer</Option>
                        <Option value="Multiple Choice">Multiple Choice</Option>
                        <Option value="Checkbox">Checkbox</Option>
                        <Option value="Drop Down">Drop Down</Option>
                        <Option value="Date">Date</Option>
                        {/* <Option value="Photo Upload">Photo Upload</Option> */}
                      </Select>
                  </Col>
                  <Col span={4}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => duplicateAdditionalForm(form.id)}
                        size="small"
                        style={{ color: '#1890ff' }}
                        title="Duplicate"
                      />
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => removeAdditionalForm(form.id)}
                        size="small"
                        style={{ color: '#999' }}
                        title="Delete"
                      />
                    </div>
                  </Col>
                </Row>
              </div>

              {form.type === "Short Answer" && (
                <div style={{ marginBottom: '20px' }}>
                </div>
              )}

              {form.type === "Date" && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    marginBottom: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1890ff'
                  }}>
                    Date Settings
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Min Date</span>
                      </div>
                      <Input
                        type="date"
                        value={form.settings?.minDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateFormSettings(form.id, 'minDate', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Max Date</span>
                      </div>
                      <Input
                        type="date"
                        value={form.settings?.maxDate || new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0]}
                        onChange={(e) => updateFormSettings(form.id, 'maxDate', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: '12px' }}>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Allow Future Dates</span>
                      </div>
                      <Select
                        value={form.settings?.allowFuture || true}
                        onChange={(value) => updateFormSettings(form.id, 'allowFuture', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Allow Past Dates</span>
                      </div>
                      <Select
                        value={form.settings?.allowPast || true}
                        onChange={(value) => updateFormSettings(form.id, 'allowPast', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Col>
                  </Row>
                </div>
              )}

              {/* {form.type === "Photo Upload" && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#52c41a'
                  }}>
                    📷 Students will be able to upload photos for this question
                  </div>
                </div>
              )} */}

              {form.type === "Drop Down" && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    marginBottom: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1890ff'
                  }}>
                    Dropdown Settings
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Allow Multiple Selection</span>
                      </div>
                      <Select
                        value={form.settings?.allowMultiple || false}
                        onChange={(value) => updateFormSettings(form.id, 'allowMultiple', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Searchable</span>
                      </div>
                      <Select
                        value={form.settings?.searchable || true}
                        onChange={(value) => updateFormSettings(form.id, 'searchable', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Col>
                  </Row>
                </div>
              )}

              {(form.type === "Drop Down" || form.type === "Multiple Choice" || form.type === "Checkbox") && (
                <div style={{ marginBottom: '20px' }}>
                  {form.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      gap: '8px'
                    }}>
                      {(form.type === "Drop Down" || form.type === "Multiple Choice" || form.type === "Checkbox") && (
                        <div
                          onClick={() => handleOptionSelection(form.id, optionIndex)}
                          style={{
                            width: '16px',
                            height: '16px',
                            border: `2px solid ${form.selectedOptions?.includes(optionIndex) ? '#1890ff' : '#d9d9d9'}`,
                            borderRadius: form.type === "Multiple Choice" ? '50%' : '3px',
                            backgroundColor: form.selectedOptions?.includes(optionIndex) ? '#1890ff' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {form.selectedOptions?.includes(optionIndex) && (
                            form.type === "Multiple Choice" ? (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#fff',
                                borderRadius: '50%'
                              }} />
                            ) : (
                              <div style={{
                                width: '8px',
                                height: '5px',
                                border: '2px solid #fff',
                                borderTop: 'none',
                                borderRight: 'none',
                                transform: 'rotate(-45deg)',
                                marginTop: '-2px'
                              }} />
                            )
                          )}
                        </div>
                      )}

                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOptionInForm(form.id, optionIndex, e.target.value)}
                        style={{
                          width: '100%',
                          border: form.selectedOptions?.includes(optionIndex) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: form.selectedOptions?.includes(optionIndex) ? '#f0f8ff' : '#fff'
                        }}
                      />
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => removeOptionInForm(form.id, optionIndex)}
                        size="small"
                        style={{ color: '#999' }}
                      />
                    </div>
                  ))}
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => addOptionToForm(form.id)}
                    style={{ padding: '0', color: '#1890ff', fontSize: '14px', marginTop: '8px' }}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>
                      {form.name || "Sample Question"}
                    </span>
                    {form.type === "Short Answer" && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Word limit: 50 words
                      </div>
                    )}
                    {form.type === "Date" && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Date range: {form.settings?.minDate || 'Today'} to {form.settings?.maxDate || 'Future'}
                      </div>
                    )}
                    {/* {form.type === "Photo Upload" && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Photo upload enabled
                      </div>
                    )} */}
                  </div>

                  {form.type === "Short Answer" && (
                    <Input.TextArea
                      placeholder="Type your answer here..."
                      rows={3}
                      disabled
                      style={{ backgroundColor: '#fff' }}
                    />
                  )}

                  {form.type === "Date" && (
                    <Input
                      type="date"
                      disabled
                      style={{ backgroundColor: '#fff' }}
                    />
                  )}

                  {/* {form.type === "Photo Upload" && (
                    <div style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        📷 Photo Upload
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Students can upload photos here
                      </div>
                    </div>
                  )} */}

                  {(form.type === "Drop Down" || form.type === "Multiple Choice" || form.type === "Checkbox") && (
                    <div>
                      {form.options.map((option, optionIndex) => (
                        <div key={optionIndex} style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #d9d9d9',
                            borderRadius: form.type === "Multiple Choice" ? '50%' : '3px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            {form.type === "Multiple Choice" && (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#d9d9d9',
                                borderRadius: '50%'
                              }} />
                            )}
                          </div>
                          <span style={{ color: '#666' }}>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


            </div>
          )) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              fontSize: '14px'
            }}>
              No additional details added yet. Click "Add Additional Detail" to create one.
            </div>
          )}

          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={addAdditionalForm}
            style={{ padding: '0', color: '#1890ff', fontSize: '14px', marginTop: '8px' }}
          >
            Add Additional Detail
          </Button>
        </div>
      </div>
    );
  }, [activeTab, dataByTab, additionalForms, activeKeys, stages, windowWidth, handleCriteriaChange, renderCriteriaContent, handleStudentDetailsChange, handleSchoolDetailsChange, addAdditionalForm, handleFormTypeChange, duplicateAdditionalForm, removeAdditionalForm, updateAdditionalForm, updateFormSettings, addOptionToForm, updateOptionInForm, removeOptionInForm, handleOptionSelection]);

  const tabItems = useMemo(() => stages.map((stage) => ({
    key: stage.id.toString(),
    label: stage.name,
    children: renderTabContent(),
  })), [stages, renderTabContent]);

  // Debug: Log tab items
  useEffect(() => {
    console.log('Tab items updated:', tabItems);
  }, [tabItems]);

  return (
    <div style={{
      background: '#f5f5f5',
      minHeight: '100vh',
      padding: '0',
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <div style={{
        background: '#fff',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {stages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Title level={4}>No stages found for this competition. Please add stages first.</Title>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              console.log('Tab changed from', activeTab, 'to', key);
              setActiveTab(key);
            }}
            items={tabItems}
            style={{
              height: '100vh',
              overflow: 'hidden'
            }}
            tabBarStyle={{
              margin: '0',
              paddingLeft: windowWidth <= 768 ? '16px' : '40px',
              paddingRight: windowWidth <= 768 ? '16px' : '40px',
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              position: 'sticky',
              top: 0,
              zIndex: 100
            }}
          />
        )}

        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          // background: '#fff',
          // borderTop: '1px solid #f0f0f0',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          // boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="default"
              size="small"
              onClick={() => {
                if (competitionId) {
                  const localKey = `competition_eligibility_${competitionId}`;
                  const savedData = localStorage.getItem(localKey);
                  console.log('Current localStorage data:', savedData ? JSON.parse(savedData) : 'No data');
                  message.info('Check console for localStorage data');
                }
              }}
              title="Debug localStorage"
            >
              Debug
            </Button>
            <Button
              type="default"
              size="small"
              onClick={() => {
                if (competitionId) {
                  const localKey = `competition_eligibility_${competitionId}`;
                  localStorage.removeItem(localKey);
                  message.success('localStorage cleared');
                  window.location.reload();
                }
              }}
              title="Clear localStorage and reload"
            >
              Clear & Reload
            </Button>
          </div>
          <Button
            type="primary"
            size="large"
            disabled={!allStagesHaveData || !additionalFormsValid || loading}
            loading={loading}
            style={{
              background: (!allStagesHaveData || !additionalFormsValid || loading) ? '#d9d9d9' : '#4CAF50',
              borderRadius: '6px',
              padding: '0 32px',
              height: '40px',
              minWidth: windowWidth <= 768 ? '120px' : '180px'
            }}
            onClick={saveEligibilityData}
          >
            Save and Continue
          </Button>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .ant-tabs-content-holder {
              padding: 16px !important;
            }
            .ant-select-selector {
              padding: 8px 12px !important;
            }
            .ant-collapse-header {
              padding: 12px 16px !important;
            }
            .ant-collapse-content-box {
              padding: 16px !important;
            }
            .fixed-footer {
              padding: 12px 16px !important;
            }
          }

          @media (max-width: 480px) {
            .ant-tabs-tab {
              padding: 8px 12px !important;
              font-size: 14px !important;
            }
            .ant-btn-lg {
              height: 36px !important;
              padding: 0 20px !important;
              font-size: 14px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OEligibility;
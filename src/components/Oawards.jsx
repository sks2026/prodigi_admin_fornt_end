import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Select,
  Collapse,
  Input,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Form,
  Card,
  message,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title } = Typography;

const 
Oawards = ({ fun, ID }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("");
  const [awardTypesByTab, setAwardTypesByTab] = useState({});
  const [activeKeys, setActiveKeys] = useState([]);
  const [selectedAwardType, setSelectedAwardType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stages, setStages] = useState([]); // New state for stages
  const [awardTypeDropdownOpen, setAwardTypeDropdownOpen] = useState(false); // State for dropdown visibility
  const hoverTimerRef = useRef(null);

  // Use ID from props if available, otherwise use id from params
  const competitionId = ID || id;

  // Fetch competition data and stages
  const fetchCompetitionData = async () => {
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
      console.log("Fetched competition data:", result);

      // Extract stages from overviewdata
      if (result.overviewdata && Array.isArray(result.overviewdata.stages)) {
        const stagesData = result.overviewdata.stages;
        setStages(stagesData);

        // Initialize awardTypesByTab for each stage
        const initialAwardTypesByTab = {};
        stagesData.forEach((stage) => {
          initialAwardTypesByTab[stage.id.toString()] = [];
        });

        // Set the first stage as active tab if available
        if (stagesData.length > 0 && !activeTab) {
          setActiveTab(stagesData[0].id.toString());
        }

        setAwardTypesByTab(initialAwardTypesByTab);
        console.log("Stages loaded:", stagesData);

        // Show message if no award types exist yet
        if (Object.keys(initialAwardTypesByTab).every(key => initialAwardTypesByTab[key].length === 0)) {
          message.info("Please add at least 1 award type to each stage to proceed.");
        }
      } else {
        console.warn("No stages found in overviewdata");
        // message.error("No stages found for this competition");
      }
    } catch (error) {
      console.error("Error fetching competition data:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (competitionId) {
      fetchCompetitionData();
    }
  }, [competitionId]);

  // Update active tab when stages change
  useEffect(() => {
    if (stages.length > 0 && !activeTab) {
      setActiveTab(stages[0].id.toString());
    }
  }, [stages, activeTab]);

  // Available award type options
  const awardTypeOptions = [
    { value: "certificate", label: "Certificate" },
    { value: "trophy", label: "Trophy" },
    { value: "medal", label: "Medal" },
    { value: "cash", label: "Cash" },
    { value: "voucher", label: "Voucher" },
    { value: "scholarship", label: "Scholarship" },
    { value: "momento", label: "Momento" }
  ];

  const handleAwardTypeSelect = (value) => {
    const selectedOption = awardTypeOptions.find(
      (option) => option.value === value
    );
    if (selectedOption) {
      const newAwardType = {
        id: Date.now(),
        name: selectedOption.label,
        value: selectedOption.value,
        rows: [
          {
            id: Date.now() + 1,
            quantity: "",
            givenTo: "",
          }
        ],
      };

      setAwardTypesByTab((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), newAwardType]
      }));
      setActiveKeys((prev) => [...prev, newAwardType.id.toString()]);
      setSelectedAwardType(null); // Reset dropdown
    }
  };

  const addRow = (typeId) => {
    setAwardTypesByTab((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map((type) => {
        if (type.id === typeId) {
          const newRow = {
            id: Date.now(),
            quantity: "",
            givenTo: "",
          };
          return {
            ...type,
            rows: [...type.rows, newRow],
          };
        }
        return type;
      })
    }));
  };

  const removeRow = (typeId, rowId) => {
    setAwardTypesByTab((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map((type) => {
        if (type.id === typeId) {
          return {
            ...type,
            rows: type.rows.filter((row) => row.id !== rowId),
          };
        }
        return type;
      })
    }));
  };

  const updateRow = (typeId, rowId, field, value) => {
    setAwardTypesByTab((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map((type) => {
        if (type.id === typeId) {
          return {
            ...type,
            rows: type.rows.map((row) => {
              if (row.id === rowId) {
                return { ...row, [field]: value };
              }
              return row;
            }),
          };
        }
        return type;
      })
    }));
  };

  const removeType = (typeId) => {
    setAwardTypesByTab((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter((type) => type.id !== typeId)
    }));
    setActiveKeys((prev) => prev.filter((key) => key !== typeId.toString()));
  };

  const renderAwardTypeContent = (type) => {
    return (
      <div style={{ padding: "16px 0" }}>
        {type.rows.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#999", padding: "20px 0" }}
          >
            No data added yet. Click "Add Row" to start adding data.
          </div>
        ) : (
          type.rows.map((row) => (
            <Row key={row.id} gutter={16} style={{ marginBottom: 16 }}>
              <Col span={10}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Quantity<span style={{ color: "red" }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter quantity per student"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(type.id, row.id, "quantity", e.target.value)
                    }
                  />
                </div>
              </Col>
              <Col span={10}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Given To<span style={{ color: "red" }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter who gets the award (e.g., Student, Class, School)"
                    value={row.givenTo}
                    onChange={(e) =>
                      updateRow(type.id, row.id, "givenTo", e.target.value)
                    }
                  />
                </div>
              </Col>
              <Col
                span={4}
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "end",
                }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeRow(type.id, row.id)}
                  style={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>
          ))
        )}

        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() => addRow(type.id)}
          style={{ color: "#1890ff", padding: 0, marginTop: 8 }}
        >
          Add Row
        </Button>
      </div>
    );
  };

  const customCollapseHeader = (type) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <span style={{ fontWeight: 500 }}>{type.name}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="text"
            size="small"
            icon={
              activeKeys.includes(type.id.toString()) ? (
                <UpOutlined />
              ) : (
                <DownOutlined />
              )
            }
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              removeType(type.id);
            }}
            style={{ color: "#ff4d4f" }}
          />
        </div>
      </div>
    );
  };

  // Filter out already selected award types for current tab
  const currentTabAwardTypes = (activeTab && awardTypesByTab[activeTab]) ? awardTypesByTab[activeTab] : [];
  const availableOptions = awardTypeOptions.filter(
    (option) => !currentTabAwardTypes.some((type) => type.value === option.value)
  );

  console.log('Debug - activeTab:', activeTab);
  console.log('Debug - currentTabAwardTypes:', currentTabAwardTypes);
  console.log('Debug - availableOptions:', availableOptions);

  // Transform data to API format
  const transformDataForAPI = () => {
    const awards = [];

    stages.forEach((stage) => {
      const stageAwardTypes = awardTypesByTab[stage.id.toString()] || [];
      stageAwardTypes.forEach((type) => {
        type.rows.forEach((row) => {
          if (row.quantity && row.givenTo) {
            awards.push({
              Award_Type: type.name,
              Quantity: parseInt(row.quantity) || 0,
              Given_To: row.givenTo,
              stage: stage.name // Add stage information
            });
          }
        });
      });
    });

    return awards;
  };

  // API call function
  const publishAwards = async () => {
    setLoading(true);

    try {
      const awards = transformDataForAPI();

      if (awards.length === 0) {
        message.warning(
          "Please add at least one complete award entry before publishing."
        );
        setLoading(false);
        return;
      }

      // Check if all stages have awards
      const stagesWithoutAwards = stages.filter(stage => {
        const stageAwardTypes = awardTypesByTab[stage.id.toString()] || [];
        return stageAwardTypes.length === 0 || !stageAwardTypes.every(type => 
          type.rows.length > 0 && type.rows.every(row => row.quantity && row.givenTo)
        );
      });

      if (stagesWithoutAwards.length > 0) {
        const stageNames = stagesWithoutAwards.map(stage => stage.name).join(', ');
        message.warning(
          `Please add at least 1 award type with complete data to the following stage(s): ${stageNames}`
        );
        setLoading(false);
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        awards: awards,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        `https://api.prodigiedu.com/api/competitions/awards/${competitionId}`,
        requestOptions
      );

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);
        message.success("Awards published successfully!");
        navigate("/organiser/dashboard");

        // Optional: Reset form after successful submission
        // setAwardTypes([]);
        // setActiveKeys([]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error publishing awards:", error);
      message.error("Failed to publish awards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if all stages have awards for save button state
  const allStagesHaveAwards = stages.length > 0 && stages.every(stage => {
    const stageAwardTypes = awardTypesByTab[stage.id.toString()] || [];
    // At least 1 award type is mandatory
    if (stageAwardTypes.length === 0) return false;

    // Each award type must have at least 1 row with complete data
    for (const type of stageAwardTypes) {
      if (type.rows.length === 0) return false;
      for (const row of type.rows) {
        if (!row.quantity || !row.givenTo) return false;
      }
    }
    return true;
  });

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Card style={{ maxWidth: "100%", margin: "0 auto" }}>
                {stages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Title level={4}>No stages found for this competition. Please add stages first.</Title>
          </div>
        ) : (
          <>
            <Tabs 
              activeKey={activeTab}
              onChange={setActiveTab}
              items={stages.map((stage) => ({
                key: stage.id.toString(),
                label: stage.name,
              }))}
            />
            
            <div style={{ marginTop: 24 }}>
          <Title level={3} style={{ marginBottom: 24 }}>
            Awards
          </Title>

          <Row style={{ marginBottom: 24 }}>
            <Col span={12}>
              <div
                onMouseEnter={() => {
                  if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                  }
                  setAwardTypeDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  hoverTimerRef.current = setTimeout(() => {
                    setAwardTypeDropdownOpen(false);
                  }, 300);
                }}
                style={{ position: 'relative' }}
              >
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Award Type
                </label>
                <Select
                  placeholder="Select All Award Types"
                  style={{ width: "100%" }}
                  value={selectedAwardType}
                  onChange={handleAwardTypeSelect}
                  suffixIcon={<DownOutlined />}
                  options={availableOptions}
                  size="large"
                  showSearch
                  open={awardTypeDropdownOpen}
                  onDropdownOpenChange={(open) => {
                    if (hoverTimerRef.current) {
                      clearTimeout(hoverTimerRef.current);
                    }
                    setAwardTypeDropdownOpen(open);
                  }}
                  onFocus={() => {
                    if (hoverTimerRef.current) {
                      clearTimeout(hoverTimerRef.current);
                    }
                    setAwardTypeDropdownOpen(true);
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  getPopupContainer={(trigger) => trigger.parentElement}
                />
              </div>
            </Col>
          </Row>

          {currentTabAwardTypes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                padding: "40px 20px",
                border: "2px dashed #d9d9d9",
                borderRadius: "8px",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                No Award Types Added
              </div>
              <div style={{ fontSize: "14px" }}>
                At least 1 award type is mandatory. Select an award type from the dropdown above to get started.
              </div>
            </div>
          ) : (
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              style={{ marginBottom: 24 }}
              expandIcon={() => null}
            >
              {currentTabAwardTypes.map((type) => (
                <Panel
                  key={type.id.toString()}
                  header={customCollapseHeader(type)}
                  style={{ marginBottom: 8 }}
                >
                  {renderAwardTypeContent(type)}
                </Panel>
              ))}
            </Collapse>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 32,
            }}
          >
            <Button
              type=""
              size="large"
              disabled={!allStagesHaveAwards || loading}
              loading={loading}
              onClick={() => setIsModalVisible(true)}
              style={{
                backgroundColor: !allStagesHaveAwards ? "#dadada" : "#4CAF50",
                color: "#ffffff",
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "6px",
              }}
            >
              Publish
            </Button>
          </div>
        </div>
          </>
        )}
      </Card>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)} style={{ color: "#4CAF50", borderColor: "#4CAF50", background: "#fff" }}>
            No, Back
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ background: "#4CAF50", borderColor: "#4CAF50" }}
            loading={loading}
            onClick={async () => {
              await publishAwards();
              setIsModalVisible(false);
            }}
          >
            Yes, Publish
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
            Are you sure you want to publish this Competition?
          </div>
          <div style={{ color: "#555", fontSize: 16 }}>
            Please review the details thoroughly. You will not be able to change any detail once the competition is published.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Oawards;

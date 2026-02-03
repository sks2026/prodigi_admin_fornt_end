import { useState, useEffect, useRef } from "react"
import {
  Input,
  DatePicker,
  Select,
  Button,
  Form,
  Row,
  Col,
  Typography,
  message,
  Card,
  Space,
  Divider,
  Tag
} from 'antd';
import {
  PlusOutlined,
  CloseOutlined,
  BankOutlined,
  ReloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Student Details options for dropdowns (for future use)
// Note: This array is currently not used but kept for future functionality

export default function Oregistration({ fun, ID, organizerData }) {
  const { id } = useParams();
  const [plans, setPlans] = useState([]); // Remove default plan
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [stages, setStages] = useState([]); // New state for stages
  const [bankAccounts, setBankAccounts] = useState([]); // Remove default bank account
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const startDateTimerRef = useRef(null);
  const endDateTimerRef = useRef(null);
  const navigate = useNavigate();


  // Use ID from props if available, otherwise use id from params
  const competitionId = ID || id;

  // Form data state
  const [registrationData, setRegistrationData] = useState({
    totalRegistrationFee: '', // Remove default fee
    registrationStartDate: '',
    registrationEndDate: '',
    bankAccount: '', // Remove default bank account
    bankAccountNumber: '',
    paymentType: 'online' // Default payment type: 'cash', 'online', 'both'
  });

  // Safely get bank data from localStorage
  const bankDataString = localStorage.getItem("bankAccount");
  const bankData = bankDataString ? JSON.parse(bankDataString) : null;
  // Note: bankId is not currently used in this component


  // Fetch bank accounts by organizer ID
  const fetchBankAccounts = async () => {
    try {
      // Use organizerData from props if available, otherwise fallback to localStorage
      let organizerId;
      
      if (organizerData?._id) {
        organizerId = organizerData._id;
      } else {
        const userDataString = localStorage.getItem('user_Data');
        
        if (!userDataString) {
          message.warning('Please login first to load bank accounts');
          setBankAccounts([]);
          return;
        }
        
        const userData = JSON.parse(userDataString);
        organizerId = userData?._id;
      }

      if (!organizerId) {
        message.warning('Organization ID not found.');
        setBankAccounts([]);
        return;
      }
      
      const requestOptions = {
        method: "GET",
        headers: {
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\""
        },
        mode: "cors",
        credentials: "omit",
        redirect: "follow",
      };

      const url = `https://api.prodigiedu.com/api/competitions/bankaccount/${organizerId}`;
      
      const response = await fetch(url, requestOptions);

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data)) {
          const formattedAccounts = result.data.map((account) => ({
            value: account._id,
            label: `Account - ${account.accountNumber}`,
            accountNumber: account.accountNumber,
            ifsc: account.ifsc,
            accountType: account.accountType,
            color: '#1890ff'
          }));
          
          setBankAccounts(formattedAccounts);
          
          if (formattedAccounts.length > 0) {
            message.success(`${formattedAccounts.length} bank account(s) loaded`);
          } else {
            message.info('No bank accounts found');
          }
        } else {
          setBankAccounts([]);
          message.info('No bank accounts available');
        }
       
      } else {
        const errorResult = await response.json();
        message.error(errorResult.message || 'Failed to load bank accounts');
        setBankAccounts([]);
      }
    } catch (error) {
      message.error('Failed to load bank accounts');
      setBankAccounts([]);
    }
  };

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
      
      // Extract stages from overviewdata
      if (result.overviewdata && Array.isArray(result.overviewdata.stages)) {
        const stagesData = result.overviewdata.stages;
        setStages(stagesData);
      } else {
        console.warn("No stages found in overviewdata");
      }
    } catch (error) {
      console.error("Error fetching competition data:", error);
    }
  };

  // Fetch registration data
  const fetchRegistrationData = async () => {
    
    if (!competitionId) return;

    setFetchLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch(`https://api.prodigiedu.com/api/competitions/registration/${competitionId}`, requestOptions);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const { registration_type, plans: fetchedPlans } = result.data;
          
          // Update registration data
          if (registration_type) {
            setRegistrationData({
              totalRegistrationFee: registration_type.total_registration_fee || '',
              registrationStartDate: registration_type.registration_start_date || '',
              registrationEndDate: registration_type.registration_end_date || '',
              bankAccount: registration_type.bank_account || '',
              bankAccountNumber: registration_type.bank_account_number || '',
              paymentType: registration_type.payment_type || 'online'
            });
          }
          
          // Update plans data
          if (fetchedPlans && Array.isArray(fetchedPlans)) {
            const formattedPlans = fetchedPlans.map((plan, index) => ({
              id: Date.now() + index,
              name: plan.name || '',
              planFee: plan.plan_fee || '',
              studentLimit: plan.student_limit || '',
              description: plan.description || '',
              included: plan.included || '',
              not_included: plan.not_included || ''
            }));
            setPlans(formattedPlans);
          }
        }
      } else {
        console.log('No existing registration data found');
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      // Don't show error message as this might be the first time creating registration
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (competitionId) {
      fetchCompetitionData(); // Fetch stages data
      fetchRegistrationData(); // Fetch registration data
      fetchBankAccounts(); // Fetch bank accounts
    } else {
      console.log('⚠️ No competition ID available, skipping data fetch');
    }
  }, [competitionId]);

  const addPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: '',
      planFee: '',
      studentLimit: '',
      description: '',
      included: '• ',
      notIncluded: '• '
    };
    setPlans([...plans, newPlan]);
  };

  const removePlan = (planId) => {
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    setPlans(updatedPlans);
  };

  const updatePlan = (planId, field, value) => {
    
    // Auto-format bullet points for included and notIncluded fields
    let formattedValue = value;
    if ((field === 'included' || field === 'notIncluded') && value) {
      // Split by lines and ensure each line starts with a bullet point
      const lines = value.split('\n');
      formattedValue = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
          return `• ${trimmedLine}`;
        }
        return trimmedLine;
      }).join('\n');
      
      if (formattedValue !== value) {
      }
    }
    
    setPlans(plans.map(plan =>
      plan.id === planId ? { ...plan, [field]: formattedValue } : plan
    ));
    
  };

  const updateRegistrationData = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    console.log('🔵 Save and Continue button clicked');
    console.log('📊 Current registration data:', registrationData);
    
    try {
      // Validate required fields
      console.log('Validating registration data:', registrationData);
      
      if (!registrationData.totalRegistrationFee || registrationData.totalRegistrationFee.trim() === '') {
        message.error('Please enter total registration fee');
        return;
      }

      if (!registrationData.registrationStartDate) {
        message.error('Please select registration start date');
        return;
      }

      if (!registrationData.registrationEndDate) {
        message.error('Please select registration end date');
        return;
      }

      if (!registrationData.bankAccount) {
        message.error('Please select a bank account');
        return;
      }

      // Validate custom bank account number if custom account is selected
      if ((registrationData.bankAccount === 'custom' || registrationData.bankAccount?.startsWith('custom_')) && !registrationData.bankAccountNumber) {
        message.error('Please enter bank account number');
        return;
      }

      // Plans are now optional - no validation required
      // if (plans.length === 0) {
      //   message.error('Please add at least one plan');
      //   return;
      // }

      // Validate plans only if they exist
      if (plans.length > 0) {
        for (let i = 0; i < plans.length; i++) {
          const plan = plans[i];
          if (!plan.name || !plan.planFee || !plan.description) {
            message.error(`Please fill all required fields for Plan ${i + 1}`);
            return;
          }
          
          // Check if included and notIncluded have content beyond just bullet points
          if (!plan.included || plan.included.trim() === '•' || plan.included.trim() === '') {
            message.error(`Please add content for "What Is Included?" in Plan ${i + 1}`);
            return;
          }
          
          if (!plan.notIncluded || plan.notIncluded.trim() === '•' || plan.notIncluded.trim() === '') {
            message.error(`Please add content for "What Is Not Included?" in Plan ${i + 1}`);
            return;
          }
        }
      }

      console.log('✅ All validations passed');
      setLoading(true);

      // Prepare API data structure
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const apiData = {
        registration_type: {
          total_registration_fee: parseFloat(registrationData.totalRegistrationFee),
          registration_start_date: registrationData.registrationStartDate,
          registration_end_date: registrationData.registrationEndDate,
          bank_account: registrationData.bankAccount,
          bank_account_number: registrationData.bankAccountNumber || '',
          payment_type: registrationData.paymentType || 'online'
        },
        plans: plans.length > 0 ? plans.map(plan => ({
          name: plan.name,
          plan_fee: parseFloat(plan.planFee),
          student_limit: plan.studentLimit ? parseInt(plan.studentLimit) : null,
          description: plan.description,
          included: plan.included,
          not_included: plan.notIncluded
        })) : []
      };
      
      console.log('📤 Sending API Data:', apiData);
      const raw = JSON.stringify(apiData);

      // Note: Backend handles both create and update with the same POST endpoint
      
      const requestOptions = {
        method: "POST", // Backend uses POST for both create and update
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      }; 
      
      console.log('🌐 Making API call to:', `https://api.prodigiedu.com/api/competitions/registration/${competitionId}`);
      const response = await fetch(`https://api.prodigiedu.com/api/competitions/registration/${competitionId}`, requestOptions);
      
      console.log('📥 API Response status:', response.status);
      
      if (response.ok) {
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          result = await response.text();
        }
        
        console.log('✅ Registration API Response:', result);
        message.success('Registration data saved successfully!');

        // Wait a moment for the message to be visible
        setTimeout(() => {
          console.log('🚀 Calling parent function with competitionId:', competitionId);
          // Call parent function if provided
          if (fun) {
            console.log('✅ fun function exists, calling fun(5, competitionId)');
            fun(5, competitionId);
          } else {
            console.log('⚠️ fun function not provided, navigating manually');
            // If no parent function, navigate manually to next step
            try {
              navigate(`/competition/${competitionId}/overview`);
            } catch (navError) {
              navigate(`/overview/${competitionId}`);
            }
          }
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('❌ Registration API Error:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Registration Error Details:', error);
      message.error(`Failed to save registration data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>Loading registration data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .registration-form .ant-form-item-label > label {
          font-weight: 500;
          color: #262626;
        }
        
        .registration-form .ant-input,
        .registration-form .ant-input-number,
        .registration-form .ant-select-selector,
        .registration-form .ant-input-textarea,
        .registration-form .ant-picker {
          border-radius: 6px;
        }
        
        .registration-form .ant-input:hover,
        .registration-form .ant-select-selector:hover,
        .registration-form .ant-picker:hover {
          border-color: #40a9ff;
        }
        
        .registration-form .ant-input:focus,
        .registration-form .ant-select-focused .ant-select-selector,
        .registration-form .ant-picker-focused {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
        
        .registration-form .ant-space {
          display: flex;
          width: 100%;
        }
        
        .registration-form .ant-picker {
          width: 100%;
        }
        
        .registration-form .ant-picker-suffix {
          color: #1890ff;
          font-size: 16px;
        }
        
        .registration-form .ant-picker-input input {
          cursor: pointer;
        }
        
        .registration-form .ant-picker:hover .ant-picker-suffix {
          color: #40a9ff;
        }
        
        .plan-card {
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          background: #ffffff;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .plan-card:hover {
          border-color: #d9d9d9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .registration-form .ant-form-item {
          margin-bottom: 20px;
        }
        
        .plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .plan-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
        
        .save-button-container {
          text-align: right;
          margin-top: 40px;
          padding-top: 24px;
          padding-bottom: 40px;
          border-top: 1px solid #f0f0f0;
          width: 100%;
          max-width: 100%;
          clear: both;
          box-sizing: border-box;
        }
        
        .add-plan-button {
          color: #1890ff;
          padding: 0;
          margin-bottom: 40px;
          font-weight: 500;
        }
        
        .add-plan-button:hover {
          color: #40a9ff;
        }
        
        .save-button-container button {
          display: inline-block !important;
          visibility: visible !important;
          max-width: 100%;
        }
        
        @media (max-width: 768px) {
          .plan-card {
            padding: 16px;
            width: 100%;
          }
          
          .registration-form .ant-form-item {
            margin-bottom: 16px;
          }
          
          .save-button-container {
            padding-bottom: 20px;
            text-align: center;
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .save-button-container button {
            width: 100%;
            max-width: 300px;
          }
          
          .registration-form .ant-space {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .registration-form .ant-space .ant-picker {
            width: 100% !important;
          }
        }
      `}</style>
      
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '24px', overflow: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '120px' }}>
          <Title level={2} style={{ marginBottom: 32, fontWeight: 600, color: '#262626' }}>Registration</Title>

          <Form 
            form={form} 
            layout="vertical"
            className="registration-form"
          >
          <Form.Item
            label={<span>Total Registration Fee<span style={{ color: '#ff4d4f' }}>*</span></span>}
            style={{ maxWidth: 400 }}
          >
            <Input
              size="large"
              placeholder="Enter"
              prefix={<span style={{ color: '#595959' }}>₹</span>}
              value={registrationData.totalRegistrationFee}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  updateRegistrationData('totalRegistrationFee', value);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span>Registrations Open<span style={{ color: '#ff4d4f' }}>*</span></span>}
          >
            <Space direction="horizontal" style={{ width: '100%', maxWidth: 600, gap: 8 }}>
              <div
                onMouseEnter={() => {
                  if (startDateTimerRef.current) {
                    clearTimeout(startDateTimerRef.current);
                  }
                  setStartDateOpen(true);
                }}
                onMouseLeave={() => {
                  startDateTimerRef.current = setTimeout(() => {
                    setStartDateOpen(false);
                  }, 200);
                }}
                style={{ flex: 1, width: '50%' }}
              >
                <DatePicker
                  size="large"
                  open={startDateOpen}
                  onOpenChange={(open) => {
                    if (startDateTimerRef.current) {
                      clearTimeout(startDateTimerRef.current);
                    }
                    setStartDateOpen(open);
                  }}
                  value={registrationData.registrationStartDate ? dayjs(registrationData.registrationStartDate) : null}
                  onChange={(_, dateString) => {
                    updateRegistrationData('registrationStartDate', dateString || '');
                  }}
                  onBlur={(e) => {
                    const input = e.target.value;
                    if (input && input.length >= 6) {
                      // Try to parse various date formats
                      const parsedDate = dayjs(input, ['DD/MM/YYYY', 'DD-MM-YYYY', 'DDMMYYYY', 'DD/MM/YY', 'DD-MM-YY', 'DDMMYY', 'DD MMM YYYY'], true);
                      if (parsedDate.isValid()) {
                        updateRegistrationData('registrationStartDate', parsedDate.format('DD MMM YYYY'));
                      }
                    }
                  }}
                  format="DD MMM YYYY"
                  placeholder="Select start date"
                  style={{ width: '100%' }}
                  allowClear
                  suffixIcon={<CalendarOutlined style={{ color: '#1890ff', fontSize: 18 }} />}
                  inputReadOnly={false}
                  getPopupContainer={(trigger) => trigger.parentElement}
                />
              </div>
              <div
                onMouseEnter={() => {
                  if (endDateTimerRef.current) {
                    clearTimeout(endDateTimerRef.current);
                  }
                  setEndDateOpen(true);
                }}
                onMouseLeave={() => {
                  endDateTimerRef.current = setTimeout(() => {
                    setEndDateOpen(false);
                  }, 200);
                }}
                style={{ flex: 1, width: '50%' }}
              >
                <DatePicker
                  size="large"
                  open={endDateOpen}
                  onOpenChange={(open) => {
                    if (endDateTimerRef.current) {
                      clearTimeout(endDateTimerRef.current);
                    }
                    setEndDateOpen(open);
                  }}
                  value={registrationData.registrationEndDate ? dayjs(registrationData.registrationEndDate) : null}
                  onChange={(_, dateString) => {
                    updateRegistrationData('registrationEndDate', dateString || '');
                  }}
                  onBlur={(e) => {
                    const input = e.target.value;
                    if (input && input.length >= 6) {
                      // Try to parse various date formats
                      const parsedDate = dayjs(input, ['DD/MM/YYYY', 'DD-MM-YYYY', 'DDMMYYYY', 'DD/MM/YY', 'DD-MM-YY', 'DDMMYY', 'DD MMM YYYY'], true);
                      if (parsedDate.isValid()) {
                        updateRegistrationData('registrationEndDate', parsedDate.format('DD MMM YYYY'));
                      }
                    }
                  }}
                  format="DD MMM YYYY"
                  placeholder="Select end date"
                  style={{ width: '100%' }}
                  allowClear
                  suffixIcon={<CalendarOutlined style={{ color: '#1890ff', fontSize: 18 }} />}
                  inputReadOnly={false}
                  disabledDate={(current) => {
                    // Disable dates before start date
                    if (!registrationData.registrationStartDate) return false;
                    return current && current < dayjs(registrationData.registrationStartDate);
                  }}
                  getPopupContainer={(trigger) => trigger.parentElement}
                />
              </div>
            </Space>
          </Form.Item>

          <Form.Item
            label={<span>Bank Account<span style={{ color: '#ff4d4f' }}>*</span></span>}
            style={{ width: '100%', maxWidth: 400 }}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Select
                size="large"
                value={registrationData.bankAccount}
                onChange={(value) => updateRegistrationData('bankAccount', value)}
                placeholder="Select bank account"
                getPopupContainer={(trigger) => trigger.parentElement}
                style={{ width: 'calc(100% - 40px)' }}
                onDropdownOpenChange={(open) => {
                  if (open && bankAccounts.length === 0) {
                    fetchBankAccounts();
                  }
                }}
                optionLabelProp="label"
              >
                {bankAccounts.map(account => (
                  <Select.Option
                    key={account.value}
                    value={account.value}
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BankOutlined style={{ color: '#1890ff' }} />
                        {account.accountNumber}
                      </span>
                    }
                  >
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <BankOutlined style={{ color: '#1890ff', flexShrink: 0 }} />
                        <span style={{ fontWeight: 500 }}>
                          {account.accountNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)', paddingLeft: 24 }}>
                        {account.ifsc} • {account.accountType}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={fetchBankAccounts}
                title="Refresh bank accounts"
              />
            </Space.Compact>
          </Form.Item>

          {/* Payment Type Selection */}
          <Form.Item
            label={<span>Payment Type<span style={{ color: '#ff4d4f' }}>*</span></span>}
            style={{ marginTop: 24 }}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '12px 20px',
                border: registrationData.paymentType === 'cash' ? '2px solid #52c41a' : '1px solid #d9d9d9',
                borderRadius: '8px',
                backgroundColor: registrationData.paymentType === 'cash' ? '#f6ffed' : '#ffffff',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="paymentType"
                  value="cash"
                  checked={registrationData.paymentType === 'cash'}
                  onChange={(e) => updateRegistrationData('paymentType', e.target.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#52c41a'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#262626' }}>Cash Payment</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '12px 20px',
                border: registrationData.paymentType === 'online' ? '2px solid #52c41a' : '1px solid #d9d9d9',
                borderRadius: '8px',
                backgroundColor: registrationData.paymentType === 'online' ? '#f6ffed' : '#ffffff',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="paymentType"
                  value="online"
                  checked={registrationData.paymentType === 'online'}
                  onChange={(e) => updateRegistrationData('paymentType', e.target.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#52c41a'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#262626' }}>Online Payment</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '12px 20px',
                border: registrationData.paymentType === 'both' ? '2px solid #52c41a' : '1px solid #d9d9d9',
                borderRadius: '8px',
                backgroundColor: registrationData.paymentType === 'both' ? '#f6ffed' : '#ffffff',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="paymentType"
                  value="both"
                  checked={registrationData.paymentType === 'both'}
                  onChange={(e) => updateRegistrationData('paymentType', e.target.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#52c41a'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#262626' }}>Both (Cash & Online)</span>
              </label>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
              {registrationData.paymentType === 'cash' && 'Students will pay in cash directly to the organizer'}
              {registrationData.paymentType === 'online' && 'Students will pay online through the platform'}
              {registrationData.paymentType === 'both' && 'Students can choose between cash or online payment'}
            </Text>
          </Form.Item>

          <Divider style={{ margin: '32px 0', borderColor: '#f0f0f0' }} />

          {/* Plans Section */}
          {plans.map((plan, index) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <span className="plan-title">Plan {index + 1}</span>
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  onClick={() => removePlan(plan.id)}
                  danger
                />
              </div>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={8}>
                  <Form.Item label={<span>Name<span style={{ color: '#ff4d4f' }}>*</span></span>}>
                    <Input 
                      placeholder="Enter plan name" 
                      value={plan.name} 
                      onChange={(e) => updatePlan(plan.id, 'name', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label={<span>Plan Fee<span style={{ color: '#ff4d4f' }}>*</span></span>}>
                    <Input 
                      placeholder="Enter" 
                      prefix={<span style={{ color: '#595959' }}>₹</span>}
                      value={plan.planFee} 
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          updatePlan(plan.id, 'planFee', value);
                        }
                      }} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label="Student Limit">
                    <Input 
                      placeholder="Enter" 
                      value={plan.studentLimit} 
                      onChange={(e) => updatePlan(plan.id, 'studentLimit', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span>Plan Description<span style={{ color: '#ff4d4f' }}>*</span></span>}>
                <TextArea 
                  placeholder="Short Description of the Plan" 
                  rows={3} 
                  value={plan.description} 
                  onChange={(e) => updatePlan(plan.id, 'description', e.target.value)} 
                />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    label={<span>What Is Included?<span style={{ color: '#ff4d4f' }}>*</span></span>}
                  >
                    <TextArea 
                      placeholder="• Add bullet points on inclusions in the plan" 
                      rows={4} 
                      value={plan.included} 
                      onChange={(e) => updatePlan(plan.id, 'included', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    label={<span>What Is Not Included?<span style={{ color: '#ff4d4f' }}>*</span></span>}
                  >
                    <TextArea 
                      placeholder="• Highlight what is not included in your plan" 
                      rows={4} 
                      value={plan.notIncluded} 
                      onChange={(e) => updatePlan(plan.id, 'notIncluded', e.target.value)} 
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}

          {/* Add Plan Button */}
          <div style={{ marginBottom: 24 }}>
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={addPlan}
              className="add-plan-button"
            >
              Add a Plan
            </Button>
          </div>
        </Form>

          {/* Save Button */}
          <div className="save-button-container">
            <Button
              type="button"
              htmlType="button"
              size="large"
              loading={loading}
              disabled={!registrationData.totalRegistrationFee || !registrationData.registrationStartDate || !registrationData.registrationEndDate || !registrationData.bankAccount}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Button clicked - triggering handleSubmit');
                handleSubmit();
              }}
              style={{ 
                backgroundColor: '#52c41a', 
                borderColor: '#52c41a', 
                minWidth: 180,
                height: 48,
                fontSize: 16,
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save and Continue'}
            </Button>
          </div>
      </div>
    </div>
    </>
  )
}

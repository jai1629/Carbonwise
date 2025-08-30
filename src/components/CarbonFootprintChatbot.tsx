import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Factory, Zap, Car, Plane, Utensils, Trash2, Users } from 'lucide-react';

type UserType = 'individual' | 'company' | null;
type QuestionType = 'userType' | 'electricity' | 'lpg' | 'transportation' | 'transportationType' | 'flights' | 'flightType' | 'diet' | 'fuel' | 'commute' | 'waste' | 'results';

interface IndividualData {
  electricity: number;
  lpg: number;
  transportation: number;
  transportationType: 'petrol' | 'diesel' | null;
  flights: number;
  flightType: 'short' | 'long' | null;
  vegMeals: number;
  nonVegMeals: number;
}

interface CompanyData {
  electricity: number;
  fuel: number;
  commute: number;
  flights: number;
  flightType: 'short' | 'long' | null;
  waste: number;
}

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const CarbonFootprintChatbot: React.FC = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType>('userType');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      content: "Hi! I'm EcoBot 🌱 I'll help you calculate your carbon footprint. Let's start by knowing if you're calculating for yourself or your company?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [individualData, setIndividualData] = useState<IndividualData>({
    electricity: 0,
    lpg: 0,
    transportation: 0,
    transportationType: null,
    flights: 0,
    flightType: null,
    vegMeals: 0,
    nonVegMeals: 0
  });
  const [companyData, setCompanyData] = useState<CompanyData>({
    electricity: 0,
    fuel: 0,
    commute: 0,
    flights: 0,
    flightType: null,
    waste: 0
  });

  const addMessage = (type: 'bot' | 'user', content: string) => {
    setMessages(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const calculateIndividualFootprint = (): number => {
    const electricityCO2 = (individualData.electricity * 0.70 * 12) / 1000; // tons per year
    const lpgCO2 = (individualData.lpg * 3.0 * 12) / 1000; // tons per year
    
    const transportationFactor = individualData.transportationType === 'petrol' ? 2.31 : 2.68;
    const transportationCO2 = (individualData.transportation * 12 * transportationFactor) / 1000; // tons per year
    
    const flightsCO2 = individualData.flightType === 'short' 
      ? (individualData.flights * 300) / 1000 
      : (individualData.flights * 1000) / 1000; // tons per year
    
    const dietWeeklyCO2 = (individualData.vegMeals * 1.5 + individualData.nonVegMeals * 3.0);
    const dietCO2 = (dietWeeklyCO2 * 52) / 1000; // tons per year
    
    return electricityCO2 + lpgCO2 + transportationCO2 + flightsCO2 + dietCO2;
  };

  const calculateCompanyFootprint = (): number => {
    const electricityCO2 = (companyData.electricity * 0.70 * 12) / 1000; // tons per year
    const fuelCO2 = (companyData.fuel * 2.31 * 12) / 1000; // assuming petrol equivalent, tons per year
    const commuteCO2 = companyData.commute / 1000; // already in tons per year
    
    const flightsCO2 = companyData.flightType === 'short' 
      ? (companyData.flights * 300) / 1000 
      : (companyData.flights * 1000) / 1000; // tons per year
    
    const wasteCO2 = (companyData.waste * 12 * 0.5) / 1000; // assuming 0.5 kg CO2 per kg waste, tons per year
    
    return electricityCO2 + fuelCO2 + commuteCO2 + flightsCO2 + wasteCO2;
  };

  const handleUserTypeSelection = (type: UserType) => {
    setUserType(type);
    addMessage('user', type === 'individual' ? 'Individual' : 'Company');
    
    if (type === 'individual') {
      setCurrentQuestion('electricity');
      addMessage('bot', 'Great! Let\'s start with your electricity consumption. How many kWh do you consume per month?');
    } else {
      setCurrentQuestion('electricity');
      addMessage('bot', 'Perfect! Let\'s calculate your company\'s footprint. How many kWh does your company consume per month?');
    }
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    const numValue = parseFloat(inputValue);
    addMessage('user', inputValue);

    if (userType === 'individual') {
      handleIndividualFlow(numValue);
    } else {
      handleCompanyFlow(numValue);
    }

    setInputValue('');
  };

  const handleIndividualFlow = (value: number) => {
    switch (currentQuestion) {
      case 'electricity':
        setIndividualData(prev => ({ ...prev, electricity: value }));
        setCurrentQuestion('lpg');
        addMessage('bot', 'How many LPG gas cylinders do you consume per year?');
        break;
      case 'lpg':
        setIndividualData(prev => ({ ...prev, lpg: value }));
        setCurrentQuestion('transportation');
        addMessage('bot', 'How many liters of fuel do you consume per month for transportation?');
        break;
      case 'transportation':
        setIndividualData(prev => ({ ...prev, transportation: value }));
        setCurrentQuestion('transportationType');
        addMessage('bot', 'What type of fuel do you use? Reply with "petrol" or "diesel"');
        break;
      case 'flights':
        setIndividualData(prev => ({ ...prev, flights: value }));
        setCurrentQuestion('flightType');
        addMessage('bot', 'Are these mostly "short" haul flights (domestic) or "long" haul flights (international)?');
        break;
      case 'diet':
        if (individualData.vegMeals === 0) {
          setIndividualData(prev => ({ ...prev, vegMeals: value }));
          addMessage('bot', 'How many non-vegetarian meals do you have per week?');
        } else {
          setIndividualData(prev => ({ ...prev, nonVegMeals: value }));
          setCurrentQuestion('results');
          setTimeout(() => showResults(), 1000);
        }
        break;
    }
  };

  const handleCompanyFlow = (value: number) => {
    switch (currentQuestion) {
      case 'electricity':
        setCompanyData(prev => ({ ...prev, electricity: value }));
        setCurrentQuestion('fuel');
        addMessage('bot', 'How many liters of liquid fuels does your company consume per month?');
        break;
      case 'fuel':
        setCompanyData(prev => ({ ...prev, fuel: value }));
        setCurrentQuestion('commute');
        addMessage('bot', 'What\'s the estimated annual CO2 emissions from employee commuting (in kg)?');
        break;
      case 'commute':
        setCompanyData(prev => ({ ...prev, commute: value }));
        setCurrentQuestion('flights');
        addMessage('bot', 'How many business flights does your company take per year?');
        break;
      case 'flights':
        setCompanyData(prev => ({ ...prev, flights: value }));
        setCurrentQuestion('flightType');
        addMessage('bot', 'Are these mostly "short" haul flights (domestic) or "long" haul flights (international)?');
        break;
      case 'waste':
        setCompanyData(prev => ({ ...prev, waste: value }));
        setCurrentQuestion('results');
        setTimeout(() => showResults(), 1000);
        break;
    }
  };

  const handleSpecialInput = (input: string) => {
    addMessage('user', input);

    if (currentQuestion === 'transportationType') {
      const fuelType = input.toLowerCase().includes('petrol') ? 'petrol' : 'diesel';
      setIndividualData(prev => ({ ...prev, transportationType: fuelType }));
      setCurrentQuestion('flights');
      addMessage('bot', 'How many flights do you take per year?');
    } else if (currentQuestion === 'flightType') {
      const flight = input.toLowerCase().includes('short') ? 'short' : 'long';
      
      if (userType === 'individual') {
        setIndividualData(prev => ({ ...prev, flightType: flight }));
        setCurrentQuestion('diet');
        addMessage('bot', 'Now about your diet! How many vegetarian meals do you have per week?');
      } else {
        setCompanyData(prev => ({ ...prev, flightType: flight }));
        setCurrentQuestion('waste');
        addMessage('bot', 'Finally, how much waste does your company generate per month (in kg)?');
      }
    }
  };

  const showResults = () => {
    const totalCO2 = userType === 'individual' 
      ? calculateIndividualFootprint() 
      : calculateCompanyFootprint();
    
    addMessage('bot', `🌍 Your annual carbon footprint is ${totalCO2.toFixed(2)} tons of CO2! Let me break this down for you...`);
  };

  const getMessageIcon = (type: 'bot' | 'user') => {
    return type === 'bot' ? <Leaf className="w-6 h-6 text-forest-green" /> : <Users className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-eco rounded-2xl p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-8 h-8" />
          <h1 className="text-3xl font-bold">EcoBot Carbon Calculator</h1>
        </div>
        <p className="text-lg opacity-90">
          Discover your environmental impact with our AI-powered carbon footprint calculator
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && getMessageIcon(message.type)}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-smooth ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.type === 'user' && getMessageIcon(message.type)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentQuestion === 'userType' && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleUserTypeSelection('individual')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 h-16 px-8"
          >
            <Users className="w-6 h-6" />
            Individual
          </Button>
          <Button
            onClick={() => handleUserTypeSelection('company')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 h-16 px-8"
          >
            <Factory className="w-6 h-6" />
            Company
          </Button>
        </div>
      )}

      {currentQuestion === 'transportationType' && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleSpecialInput('petrol')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Car className="w-5 h-5" />
            Petrol
          </Button>
          <Button
            onClick={() => handleSpecialInput('diesel')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Car className="w-5 h-5" />
            Diesel
          </Button>
        </div>
      )}

      {currentQuestion === 'flightType' && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleSpecialInput('short')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Plane className="w-5 h-5" />
            Short Haul
          </Button>
          <Button
            onClick={() => handleSpecialInput('long')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Plane className="w-5 h-5" />
            Long Haul
          </Button>
        </div>
      )}

      {['electricity', 'lpg', 'transportation', 'flights', 'diet', 'fuel', 'commute', 'waste'].includes(currentQuestion) && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
            placeholder="Enter your answer..."
            className="flex-1"
            type="number"
          />
          <Button onClick={handleInputSubmit} className="px-6">
            Send
          </Button>
        </div>
      )}

      {currentQuestion === 'results' && (
        <Card className="bg-gradient-nature">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {userType === 'individual' 
                    ? `${calculateIndividualFootprint().toFixed(2)} tons CO2/year`
                    : `${calculateCompanyFootprint().toFixed(2)} tons CO2/year`
                  }
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {userType === 'individual' 
                  ? "That's your personal annual carbon footprint!"
                  : "That's your company's estimated annual carbon footprint!"
                }
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-forest-green hover:bg-leaf-green"
              >
                Calculate Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarbonFootprintChatbot;
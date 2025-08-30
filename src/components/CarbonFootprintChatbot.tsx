import React, { useState, useEffect } from 'react';
import natureBackground from '@/assets/nature-ecosystem-bg.jpg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Leaf, Factory, Zap, Car, Plane, Utensils, Trash2, Users, Lightbulb, Heart, Target, TrendingDown } from 'lucide-react';

type UserType = 'individual' | 'company' | null;
type QuestionType = 'userType' | 'electricity' | 'lpg' | 'transportation' | 'transportationType' | 'flights' | 'flightType' | 'diet' | 'fuel' | 'employees' | 'commuteDistance' | 'commuteTransport' | 'commuteDays' | 'waste' | 'results';

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
  employees: number;
  commuteDistance: number;
  commuteTransport: 'car' | 'bus' | 'train' | null;
  commuteDays: number;
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
    employees: 0,
    commuteDistance: 0,
    commuteTransport: null,
    commuteDays: 0,
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
    
    // Calculate commute CO2: Distance per day (km) * Emission factor (kg/km) * Commute days/year * Employees
    let emissionFactor = 0.18; // default to car
    if (companyData.commuteTransport === 'bus') emissionFactor = 0.08;
    if (companyData.commuteTransport === 'train') emissionFactor = 0.04;
    
    const commuteCO2 = (companyData.commuteDistance * emissionFactor * companyData.commuteDays * companyData.employees) / 1000; // tons per year
    
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
        setCurrentQuestion('employees');
        addMessage('bot', 'How many employees work in your company?');
        break;
      case 'employees':
        setCompanyData(prev => ({ ...prev, employees: value }));
        setCurrentQuestion('commuteDistance');
        addMessage('bot', 'What\'s the average daily commute distance per employee (in km)?');
        break;
      case 'commuteDistance':
        setCompanyData(prev => ({ ...prev, commuteDistance: value }));
        setCurrentQuestion('commuteTransport');
        addMessage('bot', 'What\'s the primary mode of transport for employees? Reply with "car", "bus", or "train"');
        break;
      case 'commuteDays':
        setCompanyData(prev => ({ ...prev, commuteDays: value }));
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
    } else if (currentQuestion === 'commuteTransport') {
      let transport: 'car' | 'bus' | 'train' = 'car';
      if (input.toLowerCase().includes('bus')) transport = 'bus';
      if (input.toLowerCase().includes('train') || input.toLowerCase().includes('metro')) transport = 'train';
      
      setCompanyData(prev => ({ ...prev, commuteTransport: transport }));
      setCurrentQuestion('commuteDays');
      addMessage('bot', 'How many days per year do employees typically commute to the office?');
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

  const getPersonalizedTips = () => {
    if (userType === 'individual') {
      const electricityCO2 = (individualData.electricity * 0.70 * 12) / 1000;
      const transportationFactor = individualData.transportationType === 'petrol' ? 2.31 : 2.68;
      const transportationCO2 = (individualData.transportation * 12 * transportationFactor) / 1000;
      const flightsCO2 = individualData.flightType === 'short' ? (individualData.flights * 300) / 1000 : (individualData.flights * 1000) / 1000;
      
      const tips = [];
      
      if (electricityCO2 > 2) {
        tips.push({
          icon: <Zap className="w-5 h-5 text-yellow-500" />,
          title: "Reduce Electricity Usage",
          description: "Switch to LED bulbs, unplug devices when not in use, and consider renewable energy sources.",
          impact: `Could save ${(electricityCO2 * 0.3).toFixed(1)} tons CO2/year`
        });
      }
      
      if (transportationCO2 > 1.5) {
        tips.push({
          icon: <Car className="w-5 h-5 text-blue-500" />,
          title: "Optimize Transportation",
          description: "Use public transport, bike, walk, or consider electric/hybrid vehicles for daily commute.",
          impact: `Could save ${(transportationCO2 * 0.5).toFixed(1)} tons CO2/year`
        });
      }
      
      if (flightsCO2 > 2) {
        tips.push({
          icon: <Plane className="w-5 h-5 text-purple-500" />,
          title: "Mindful Flying",
          description: "Choose direct flights, economy class, and consider carbon offset programs for unavoidable flights.",
          impact: `Could save ${(flightsCO2 * 0.4).toFixed(1)} tons CO2/year`
        });
      }
      
      if (individualData.nonVegMeals > 10) {
        tips.push({
          icon: <Utensils className="w-5 h-5 text-green-500" />,
          title: "Sustainable Diet",
          description: "Try reducing meat consumption by 2-3 meals per week. Plant-based meals have a lower carbon footprint.",
          impact: "Could save 0.5-1.2 tons CO2/year"
        });
      }
      
      return tips;
    } else {
      const tips = [
        {
          icon: <Zap className="w-5 h-5 text-yellow-500" />,
          title: "Energy Efficiency",
          description: "Implement LED lighting, smart HVAC systems, and energy management systems.",
          impact: "Up to 30% energy reduction possible"
        },
        {
          icon: <Users className="w-5 h-5 text-blue-500" />,
          title: "Employee Engagement",
          description: "Promote remote work, carpooling, and provide incentives for sustainable commuting.",
          impact: "20-40% commute emissions reduction"
        },
        {
          icon: <Trash2 className="w-5 h-5 text-red-500" />,
          title: "Waste Reduction",
          description: "Implement recycling programs, go paperless, and choose sustainable suppliers.",
          impact: "50-70% waste reduction achievable"
        }
      ];
      
      return tips;
    }
  };

  const getMotivationalMessage = (totalCO2: number) => {
    const globalAverage = userType === 'individual' ? 4.8 : 50; // Global averages
    
    if (totalCO2 < globalAverage * 0.7) {
      return {
        message: "🌟 Excellent! You're already below the global average. You're making a real difference!",
        color: "text-green-600"
      };
    } else if (totalCO2 < globalAverage) {
      return {
        message: "👍 Good work! You're close to the global average. Small changes can make a big impact!",
        color: "text-blue-600"
      };
    } else {
      return {
        message: "💪 Every step counts! With the right changes, you can significantly reduce your impact.",
        color: "text-orange-600"
      };
    }
  };

  const showResults = () => {
    const totalCO2 = userType === 'individual' 
      ? calculateIndividualFootprint() 
      : calculateCompanyFootprint();
    
    addMessage('bot', `🌍 Your annual carbon footprint is ${totalCO2.toFixed(2)} tons of CO2! Let me show you how to make it even better...`);
  };

  const getMessageIcon = (type: 'bot' | 'user') => {
    return type === 'bot' ? <Leaf className="w-6 h-6 text-forest-green" /> : <Users className="w-6 h-6 text-primary" />;
  };

  return (
    <div 
      className="max-w-4xl mx-auto p-6 min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${natureBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-gradient-eco rounded-2xl p-8 mb-6 text-white backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-8 h-8" />
          <h1 className="text-3xl font-bold">EcoBot Carbon Calculator</h1>
        </div>
        <p className="text-lg opacity-90">
          Discover your environmental impact with our AI-powered carbon footprint calculator
        </p>
      </div>

      <Card className="mb-6 backdrop-blur-sm bg-background/90">
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

      {currentQuestion === 'commuteTransport' && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleSpecialInput('car')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Car className="w-5 h-5" />
            Car
          </Button>
          <Button
            onClick={() => handleSpecialInput('bus')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Car className="w-5 h-5" />
            Bus
          </Button>
          <Button
            onClick={() => handleSpecialInput('train')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Car className="w-5 h-5" />
            Train/Metro
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

      {['electricity', 'lpg', 'transportation', 'flights', 'diet', 'fuel', 'employees', 'commuteDistance', 'commuteDays', 'waste'].includes(currentQuestion) && (
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
        <div className="space-y-6 animate-fade-in">
          {/* Results Summary */}
          <Card className="bg-gradient-nature animate-scale-in">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xl px-6 py-3 animate-pulse-glow">
                    {userType === 'individual' 
                      ? `${calculateIndividualFootprint().toFixed(2)} tons CO2/year`
                      : `${calculateCompanyFootprint().toFixed(2)} tons CO2/year`
                    }
                  </Badge>
                </div>
                <div className="mb-4">
                  {(() => {
                    const totalCO2 = userType === 'individual' 
                      ? calculateIndividualFootprint() 
                      : calculateCompanyFootprint();
                    const motivational = getMotivationalMessage(totalCO2);
                    return (
                      <p className={`text-lg font-medium ${motivational.color}`}>
                        {motivational.message}
                      </p>
                    );
                  })()}
                </div>
                <p className="text-muted-foreground mb-4">
                  {userType === 'individual' 
                    ? "That's your personal annual carbon footprint!"
                    : "That's your company's estimated annual carbon footprint!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Tips */}
          <Card className="animate-slide-in-right">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-forest-green">
                <Lightbulb className="w-6 h-6" />
                Your Personalized Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getPersonalizedTips().map((tip, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 p-4 rounded-lg bg-mint-green/30 hover:bg-mint-green/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex-shrink-0 mt-1">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                    <Badge variant="outline" className="text-xs">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {tip.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Motivation Section */}
          <Card className="bg-gradient-eco text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                <h3 className="text-xl font-bold mb-3">Every Action Matters! 🌱</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg">
                    <Target className="w-6 h-6 mb-2" />
                    <span className="font-medium">Small Changes</span>
                    <span className="text-center opacity-90">Lead to big impacts over time</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg">
                    <Users className="w-6 h-6 mb-2" />
                    <span className="font-medium">Join Millions</span>
                    <span className="text-center opacity-90">Working towards a sustainable future</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg">
                    <Leaf className="w-6 h-6 mb-2" />
                    <span className="font-medium">Planet Earth</span>
                    <span className="text-center opacity-90">Needs heroes like you</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              Calculate Again
            </Button>
            <Button 
              onClick={() => {
                const totalCO2 = userType === 'individual' 
                  ? calculateIndividualFootprint() 
                  : calculateCompanyFootprint();
                const text = `I just calculated my carbon footprint: ${totalCO2.toFixed(2)} tons CO2/year using EcoBot! 🌱 Taking action to reduce my environmental impact. #CarbonFootprint #ClimateAction #Sustainability`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="bg-forest-green hover:bg-leaf-green flex items-center gap-2"
              size="lg"
            >
              <Heart className="w-5 h-5" />
              Share My Impact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonFootprintChatbot;
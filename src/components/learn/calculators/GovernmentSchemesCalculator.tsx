"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  PieChart,
  Download,
  Shield,
  Home,
  GraduationCap,
  Heart
} from "lucide-react";

interface GovernmentSchemesCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    ppfAmount?: number;
    ppfYears?: number;
    epfContribution?: number;
    npsContribution?: number;
    ssyAmount?: number;
    ssyYears?: number;
  };
  showAllSchemes?: boolean;
}

export default function GovernmentSchemesCalculator({ 
  title = "Government Schemes Calculator",
  description = "Calculate returns from PPF, EPF, NPS, SSY and other government-backed investment schemes",
  initialValues = {
    ppfAmount: 150000,
    ppfYears: 15,
    epfContribution: 25000,
    npsContribution: 10000,
    ssyAmount: 125000,
    ssyYears: 21
  },
  showAllSchemes = true
}: GovernmentSchemesCalculatorProps) {
  const [ppfAmount, setPpfAmount] = useState(initialValues.ppfAmount || 150000);
  const [ppfYears, setPpfYears] = useState(initialValues.ppfYears || 15);
  const [epfContribution, setEpfContribution] = useState(initialValues.epfContribution || 25000);
  const [npsContribution, setNpsContribution] = useState(initialValues.npsContribution || 10000);
  const [ssyAmount, setSsyAmount] = useState(initialValues.ssyAmount || 125000);
  const [ssyYears, setSsyYears] = useState(initialValues.ssyYears || 21);
  const [employeeBasicSalary, setEmployeeBasicSalary] = useState(50000);
  
  const [results, setResults] = useState({
    ppf: {
      maturity: 0,
      interest: 0,
      taxBenefit: 0
    },
    epf: {
      employeeContribution: 0,
      employerContribution: 0,
      totalCorpus: 0,
      taxSaving: 0
    },
    nps: {
      corpus: 0,
      annuityValue: 0,
      taxBenefit: 0
    },
    ssy: {
      maturity: 0,
      interest: 0,
      taxBenefit: 0
    },
    total: {
      combinedCorpus: 0,
      totalTaxSaving: 0
    }
  });

  useEffect(() => {
    calculateSchemes();
  }, [ppfAmount, ppfYears, epfContribution, npsContribution, ssyAmount, ssyYears, employeeBasicSalary]);

  const calculateSchemes = () => {
    // PPF Calculation (Current rate: 7.1% p.a., EEE treatment)
    const ppfRate = 0.071;
    const ppfMaturity = ppfAmount * Math.pow(1 + ppfRate, ppfYears);
    const ppfInterest = ppfMaturity - ppfAmount;
    const ppfTaxBenefit = Math.min(ppfAmount, 150000); // Section 80C limit

    // EPF Calculation (Employee: 12% of basic, Employer: 12% of basic + 3.67% to EPS)
    const employeeEPF = Math.min(epfContribution * 12, employeeBasicSalary * 0.12 * 12);
    const employerEPF = Math.min(employeeBasicSalary * 0.0367 * 12, 1500000 * 0.0367);
    const totalEPFContribution = employeeEPF + employerEPF;
    const epfCorpus = totalEPFContribution * Math.pow(1 + 0.0815, ppfYears); // Current EPF rate: 8.15%
    const epfTaxSaving = Math.min(employeeEPF, 150000);

    // NPS Calculation (Current rate: 9-12% expected returns)
    const npsCorpus = npsContribution * 12 * Math.pow(1 + 0.105, ppfYears); // 10.5% expected return
    const npsAnnuity = npsCorpus * 0.6; // 60% must be annuitized
    const npsTaxBenefit = Math.min(npsContribution * 12, 150000);

    // SSY Calculation (Current rate: 8.0% p.a., EEE treatment)
    const ssyRate = 0.08;
    const ssyMaturity = ssyAmount * Math.pow(1 + ssyRate, ssyYears);
    const ssyInterest = ssyMaturity - ssyAmount;
    const ssyTaxBenefit = Math.min(ssyAmount, 150000);

    const combinedCorpus = ppfMaturity + epfCorpus + npsCorpus + ssyMaturity;
    const totalTaxSaving = ppfTaxBenefit + epfTaxSaving + npsTaxBenefit + ssyTaxBenefit;

    setResults({
      ppf: {
        maturity: Math.round(ppfMaturity),
        interest: Math.round(ppfInterest),
        taxBenefit: Math.round(ppfTaxBenefit)
      },
      epf: {
        employeeContribution: Math.round(employeeEPF),
        employerContribution: Math.round(employerEPF),
        totalCorpus: Math.round(epfCorpus),
        taxSaving: Math.round(epfTaxSaving)
      },
      nps: {
        corpus: Math.round(npsCorpus),
        annuityValue: Math.round(npsAnnuity),
        taxBenefit: Math.round(npsTaxBenefit)
      },
      ssy: {
        maturity: Math.round(ssyMaturity),
        interest: Math.round(ssyInterest),
        taxBenefit: Math.round(ssyTaxBenefit)
      },
      total: {
        combinedCorpus: Math.round(combinedCorpus),
        totalTaxSaving: Math.round(totalTaxSaving)
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = () => {
    const csvContent = [
      ['Scheme', 'Annual Contribution', 'Maturity Value', 'Interest Earned', 'Tax Benefit'],
      ['PPF', ppfAmount, results.ppf.maturity, results.ppf.interest, results.ppf.taxBenefit],
      ['EPF', results.epf.employeeContribution + results.epf.employerContribution, results.epf.totalCorpus, results.epf.totalCorpus - (results.epf.employeeContribution + results.epf.employerContribution), results.epf.taxSaving],
      ['NPS', npsContribution * 12, results.nps.corpus, results.nps.corpus - (npsContribution * 12), results.nps.taxBenefit],
      ['SSY', ssyAmount, results.ssy.maturity, results.ssy.interest, results.ssy.taxBenefit],
      ['TOTAL', '', results.total.combinedCorpus, results.total.combinedCorpus - (ppfAmount + results.epf.employeeContribution + results.epf.employerContribution + npsContribution * 12 + ssyAmount), results.total.totalTaxSaving]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `government-schemes-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-green-200 bg-green-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">{title}</h3>
            <p className="text-sm text-green-700">{description}</p>
          </div>
        </div>

        <Tabs defaultValue="ppf" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ppf">PPF</TabsTrigger>
            <TabsTrigger value="epf">EPF</TabsTrigger>
            <TabsTrigger value="nps">NPS</TabsTrigger>
            <TabsTrigger value="ssy">SSY</TabsTrigger>
          </TabsList>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
            <div>
              <Label htmlFor="ppf-amount" className="text-sm font-medium text-gray-700">
                PPF Annual Amount (₹)
              </Label>
              <Input
                id="ppf-amount"
                type="number"
                value={ppfAmount}
                onChange={(e) => setPpfAmount(Number(e.target.value))}
                className="mt-1"
                min="500"
                max="150000"
                step="1000"
              />
            </div>

            <div>
              <Label htmlFor="ppf-years" className="text-sm font-medium text-gray-700">
                PPF Period (Years)
              </Label>
              <Input
                id="ppf-years"
                type="number"
                value={ppfYears}
                onChange={(e) => setPpfYears(Number(e.target.value))}
                className="mt-1"
                min="15"
                max="50"
              />
            </div>

            <div>
              <Label htmlFor="employee-salary" className="text-sm font-medium text-gray-700">
                Monthly Basic Salary (₹)
              </Label>
              <Input
                id="employee-salary"
                type="number"
                value={employeeBasicSalary}
                onChange={(e) => setEmployeeBasicSalary(Number(e.target.value))}
                className="mt-1"
                min="15000"
                step="5000"
              />
            </div>

            <div>
              <Label htmlFor="nps-contribution" className="text-sm font-medium text-gray-700">
                NPS Monthly (₹)
              </Label>
              <Input
                id="nps-contribution"
                type="number"
                value={npsContribution}
                onChange={(e) => setNpsContribution(Number(e.target.value))}
                className="mt-1"
                min="500"
                step="500"
              />
            </div>
          </div>

          <TabsContent value="ppf" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">Maturity Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.ppf.maturity)}
                </p>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Interest Earned</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.ppf.interest)}
                </p>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">Tax Benefit</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(results.ppf.taxBenefit)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 PPF Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• EEE (Exempt-Exempt-Exempt) treatment - no tax on maturity</li>
                <li>• Current interest rate: 7.1% p.a. (subject to change)</li>
                <li>• Tax benefit up to ₹1.5 lakh under Section 80C</li>
                <li>• 15-year lock-in period with premature closure options</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="epf" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Employee Contribution</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(results.epf.employeeContribution)}
                </p>
                <p className="text-xs text-gray-500">12% of basic salary</p>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Employer Contribution</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(results.epf.employerContribution)}
                </p>
                <p className="text-xs text-gray-500">3.67% of basic salary</p>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Corpus</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(results.epf.totalCorpus)}
                </p>
                <p className="text-xs text-gray-500">At retirement</p>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Tax Saving</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(results.epf.taxSaving)}
                </p>
                <p className="text-xs text-gray-500">Under Section 80C</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 EPF Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Current interest rate: 8.15% p.a. (guaranteed by government)</li>
                <li>• Employer contributes extra 3.67% beyond your contribution</li>
                <li>• Tax-free withdrawal after 5 years</li>
                <li>• Partial withdrawal allowed for specific purposes</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="nps" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">Corpus at 60</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.nps.corpus)}
                </p>
              </div>

              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">Annuity Value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.nps.anuityValue)}
                </p>
              </div>

              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Tax Benefit</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.nps.taxBenefit)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 NPS Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Additional ₹50,000 tax benefit under Section 80CCD(1B)</li>
                <li>• Choice between equity and debt funds</li>
                <li>• 60% can be withdrawn tax-free at retirement</li>
                <li>• 40% must be used to purchase annuity</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="ssy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-pink-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-pink-600" />
                  <p className="text-sm text-gray-600">Maturity Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.ssy.maturity)}
                </p>
              </div>

              <div className="bg-white border border-pink-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Interest Earned</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.ssy.interest)}
                </p>
              </div>

              <div className="bg-white border border-pink-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">Tax Benefit</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(results.ssy.taxBenefit)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 SSY Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• EEE treatment - completely tax-free maturity</li>
                <li>• Current interest rate: 8.0% p.a.</li>
                <li>• For girl child only, maximum ₹1.5 lakh per year</li>
                <li>• Partial withdrawal allowed after 5 years</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">💰 Combined Government Schemes Portfolio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Corpus at Maturity:</span>
                <span className="font-bold text-green-600">{formatCurrency(results.total.combinedCorpus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Annual Tax Savings:</span>
                <span className="font-bold text-blue-600">{formatCurrency(results.total.totalTaxSaving)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Investment Period:</strong> {ppfYears} years</p>
                <p><strong>Total Invested:</strong> {formatCurrency(ppfAmount * ppfYears + results.epf.employeeContribution * ppfYears + npsContribution * 12 * ppfYears + ssyAmount * ssyYears)}</p>
                <p><strong>Total Returns:</strong> {formatCurrency(results.total.combinedCorpus - (ppfAmount * ppfYears + results.epf.employeeContribution * ppfYears + npsContribution * 12 * ppfYears + ssyAmount * ssyYears))}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { FileText, Upload, CheckCircle, AlertCircle, Sparkles, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const ResumeModule = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
        toast.success('Resume selected!');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file upload and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis data
      const mockAnalysis = {
        skills: ['Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
        education: ['B.TECH', 'COMPUTER SCIENCE'],
        years_experience: 2,
        projects_count: 4,
        completeness: 75,
        suggestions: [
          'Add more quantifiable achievements',
          'Include relevant certifications',
          'Expand on project impact and results',
          'Add links to GitHub/Portfolio'
        ],
        strengths: [
          'Strong technical skills section',
          'Good project descriptions',
          'Clear education details'
        ],
        improvements: [
          'Add more action verbs',
          'Quantify your achievements with metrics',
          'Include soft skills'
        ]
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze resume');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8" data-testid="resume-module">
      <div>
        <h1 className="text-4xl font-bold mb-2">Resume Analysis</h1>
        <p className="text-muted-foreground">Upload your resume and get AI-powered feedback</p>
      </div>

      {!analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-2xl"
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
              <p className="text-muted-foreground">PDF format, max 5MB</p>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-16 h-16 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PDF files only</p>
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-indigo-400 font-medium">{file.name}</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              size="lg"
              className="btn-glow"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Completeness Score */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">Resume Completeness</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Overall Score</span>
                  <span className="text-3xl font-bold gradient-text">{analysis.completeness}%</span>
                </div>
                <Progress value={analysis.completeness} className="h-4" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Extracted Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl">
              <div className="text-sm text-muted-foreground mb-2">Experience</div>
              <div className="text-3xl font-bold">{analysis.years_experience} years</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-sm text-muted-foreground mb-2">Projects</div>
              <div className="text-3xl font-bold">{analysis.projects_count}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-sm text-muted-foreground mb-2">Education</div>
              <div className="text-lg font-bold">{analysis.education.join(', ')}</div>
            </div>
          </div>

          {/* Strengths */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Strengths
            </h3>
            <div className="space-y-3">
              {analysis.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                  <span className="text-green-400">✓</span>
                  <span className="text-foreground">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-violet-500" />
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {analysis.improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-violet-500/10 p-4 rounded-lg border border-orange-500/30">
                  <span className="text-violet-400">⚠️</span>
                  <span className="text-foreground">{improvement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              AI Suggestions
            </h3>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-400">💡</span>
                  <span className="text-foreground">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={reset} variant="outline" className="flex-1">
              Upload New Resume
            </Button>
            <Button className="flex-1 btn-glow">
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeModule;

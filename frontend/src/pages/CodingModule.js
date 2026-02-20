import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const CodingModule = () => {
  return (
    <div className="max-w-4xl mx-auto" data-testid="CodingModule-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-12 rounded-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
          <Construction className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold">CodingModule</h1>
        <p className="text-slate-400 text-lg">
          This module is coming soon with advanced features!
        </p>
      </motion.div>
    </div>
  );
};

export default CodingModule;

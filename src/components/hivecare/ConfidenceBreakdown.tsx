import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ConfidenceBreakdownProps {
  overallConfidence: number;
  breakdown?: {
    sizeMatch?: number;
    colorPattern?: number;
    nestingStyle?: number;
    altitudeIndicator?: number;
  };
  explainabilityDetails?: string[];
  isRockBee: boolean;
}

const ConfidenceBreakdown = ({
  overallConfidence,
  breakdown,
  explainabilityDetails,
  isRockBee,
}: ConfidenceBreakdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return 'bg-nature';
    if (value >= 50) return 'bg-caution';
    return 'bg-danger';
  };

  const getConfidenceTextColor = (value: number) => {
    if (value >= 80) return 'text-nature';
    if (value >= 50) return 'text-caution';
    return 'text-danger';
  };

  const breakdownItems = breakdown ? [
    { label: 'Size Match', value: breakdown.sizeMatch ?? 0, description: 'Body size (17-20mm for Rock Bee)' },
    { label: 'Color Pattern', value: breakdown.colorPattern ?? 0, description: 'Yellow/black banding pattern' },
    { label: 'Nesting Style', value: breakdown.nestingStyle ?? 0, description: 'Open single-comb nest' },
    { label: 'Altitude Indicator', value: breakdown.altitudeIndicator ?? 0, description: 'High elevation nesting' },
  ] : [];

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Main Confidence Display */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isRockBee ? (
              <div className="w-12 h-12 rounded-xl bg-nature/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-nature" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-danger" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {isRockBee ? 'Rock Bee Detected' : 'Not a Rock Bee'}
              </h3>
              <p className="text-sm text-muted-foreground">AI Analysis Complete</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getConfidenceTextColor(overallConfidence)}`}>
              {overallConfidence}%
            </p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallConfidence}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${getConfidenceColor(overallConfidence)}`}
          />
        </div>
      </div>

      {/* Expandable Breakdown */}
      {(breakdownItems.length > 0 || explainabilityDetails?.length) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 border-t border-border flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Why this identification?</span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Breakdown Bars */}
              {breakdownItems.length > 0 && (
                <div className="space-y-3">
                  {breakdownItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{item.label}</span>
                        <span className={`text-sm font-medium ${getConfidenceTextColor(item.value)}`}>
                          {item.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full rounded-full ${getConfidenceColor(item.value)}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Explainability Details */}
              {explainabilityDetails && explainabilityDetails.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Key Observations
                  </p>
                  <ul className="space-y-2">
                    {explainabilityDetails.map((detail, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ConfidenceBreakdown;

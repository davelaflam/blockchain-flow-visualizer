import { Typography, Button, Box } from '@mui/material';
import { motion, easeInOut } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';

const NotFoundPage: React.FC = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const nodeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: easeInOut,
      },
    },
  };

  return (
    <MainLayout showHeaderBox={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Block Not Found
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              maxWidth: '600px',
              mb: 4,
              color: 'text.secondary',
            }}
          >
            The blockchain path you're looking for doesn't exist or has been moved to another chain.
          </Typography>
        </motion.div>

        <Box sx={{ width: '100%', maxWidth: '400px', height: '150px', mb: 4, position: 'relative' }}>
          <motion.svg
            width="100%"
            height="100%"
            viewBox="0 0 400 150"
            initial="initial"
            animate="animate"
            variants={containerVariants}
          >
            <motion.path d="M 80,75 L 160,75" stroke="#2196F3" strokeWidth="3" fill="none" variants={pathVariants} />
            <motion.path
              d="M 160,75 L 240,75"
              stroke="#2196F3"
              strokeWidth="3"
              fill="none"
              variants={pathVariants}
              transition={{ delay: 0.5, duration: 1.5 }}
            />
            <motion.path
              d="M 240,75 L 320,75"
              stroke="#FF5252"
              strokeWidth="3"
              strokeDasharray="5,5"
              fill="none"
              variants={pathVariants}
              transition={{ delay: 1, duration: 1.5 }}
            />

            <motion.circle
              cx="80"
              cy="75"
              r="20"
              fill="#1F2937"
              stroke="#2196F3"
              strokeWidth="2"
              variants={nodeVariants}
            />
            <motion.circle
              cx="160"
              cy="75"
              r="20"
              fill="#1F2937"
              stroke="#2196F3"
              strokeWidth="2"
              variants={nodeVariants}
              transition={{ delay: 0.3 }}
            />
            <motion.circle
              cx="240"
              cy="75"
              r="20"
              fill="#1F2937"
              stroke="#2196F3"
              strokeWidth="2"
              variants={nodeVariants}
              transition={{ delay: 0.6 }}
            />
            <motion.circle
              cx="320"
              cy="75"
              r="20"
              fill="#1F2937"
              stroke="#FF5252"
              strokeWidth="2"
              variants={nodeVariants}
              transition={{ delay: 0.9 }}
            />

            <motion.text
              x="80"
              y="80"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              variants={nodeVariants}
              transition={{ delay: 0.4 }}
            >
              01
            </motion.text>
            <motion.text
              x="160"
              y="80"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              variants={nodeVariants}
              transition={{ delay: 0.7 }}
            >
              02
            </motion.text>
            <motion.text
              x="240"
              y="80"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              variants={nodeVariants}
              transition={{ delay: 1.0 }}
            >
              03
            </motion.text>
            <motion.text
              x="320"
              y="80"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              variants={nodeVariants}
              transition={{ delay: 1.3 }}
            >
              ??
            </motion.text>
          </motion.svg>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(33, 150, 243, 0.39)',
            }}
          >
            Return to Home Chain
          </Button>
        </motion.div>
      </Box>
    </MainLayout>
  );
};

export default NotFoundPage;

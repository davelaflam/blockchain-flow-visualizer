import { styled } from '@mui/material/styles';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number | string;
  color?: string;
  backgroundColor?: string;
}

/**
 * ProgressBarContainer is a styled component that serves as the container for the progress bar.
 */
const ProgressBarContainer = styled('div')<{ height: number | string; backgroundColor: string }>(
  ({ theme, height, backgroundColor }) => ({
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor,
    borderRadius: 4,
    overflow: 'hidden',
  })
);

/**
 * ProgressBarFill is a styled component that represents the filled portion of the progress bar.
 */
const ProgressBarFill = styled('div')<{ width: number; color: string }>(({ theme, width, color }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: color,
  transition: 'width 0.3s ease',
}));

/**
 * ProgressBar is a React functional component that renders a customizable progress bar.
 * @param value
 * @param max
 * @param height
 * @param color
 * @param backgroundColor
 * @constructor
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 8,
  color = 'primary.main',
  backgroundColor = 'action.hover',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <ProgressBarContainer height={height} backgroundColor={backgroundColor}>
      <ProgressBarFill width={percentage} color={color} />
    </ProgressBarContainer>
  );
};

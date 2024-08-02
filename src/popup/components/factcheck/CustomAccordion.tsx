import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CustomAccordionProps {
  title: string;
  count: string;
  children: React.ReactNode;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({
  title,
  count,
  children,
  expanded,
  onChange,
}) => {
  return (
    <Accordion expanded={expanded} onChange={onChange} className={`accordion ${title}-accordion`}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-content"
        id="panel-header"
      >
        <Typography className="title">
          <span>
            {count}
          </span>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default CustomAccordion;

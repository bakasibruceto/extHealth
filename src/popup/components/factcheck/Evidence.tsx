import React from 'react';
import Typography from '@mui/material/Typography';

interface EvidenceProps {
  idx : number;
  premise: {
    premise: string;
    relationship: string;
    url: string;
    title: string;
    date: string;
  };
}

const Evidence: React.FC<EvidenceProps> = ({idx, premise }) => {

  const getIcon = (url: string) => {
    return "https://www.google.com/s2/favicons?sz=32&domain_url=" + url;
  };

  const getBasedUrl = (url: string) => {
    return new URL(url).hostname;
  }

  return (
    <div key={idx} className="evidence">
      <img src={getIcon(premise.url)} alt="icon of image" />
      <div>
        <a href={premise.url} target="_blank" rel="noopener noreferrer">
          {getBasedUrl(premise.url)}
        </a>
      </div>
      <h2>
        {premise.title}
      </h2>
      <p>
        {premise.premise}
      </p>
      <p className="date">
        {premise.date ? `Published ${premise.date}` : ''}
      </p>
    </div>
  );
};

export default Evidence;
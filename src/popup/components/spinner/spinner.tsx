import React from 'react';
import { DNA } from 'react-loader-spinner';

const Spinner: React.FC = () => {
    return (
        <div className="spinner-container">
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
            />
        </div>
    );
};

export default Spinner;
  
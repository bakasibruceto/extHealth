import * as React from "react";
import { Link } from "react-router-dom";
import "./css/finalPage.css";

export default function FinalPage() {
  
  return (
    <div id="finalPage">
      <iframe src="https://drive.google.com/file/d/1mMOX4eQhBZz9ud4w-VLIYESVjDntof2z/preview" width="640" height="480" allow="autoplay"></iframe>
      <div>
        <p>
          If you skip, make sure to watch our Video Demo for a quick overview of eXtHealth’s features and instructions on how to use them.
        </p>
        <Link to={`/guide.html`} className="primary-button">Finish</Link>
      </div>
    </div>
  );
}

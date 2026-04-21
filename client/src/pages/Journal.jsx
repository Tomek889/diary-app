import { useParams } from "react-router-dom";

export default function Journal() {
  const { date } = useParams();
  return (
    <div>
      <h1>Journal</h1>
      <p>Date: {date}</p>
    </div>
  );
}

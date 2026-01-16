import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const ProductOptionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/products/${id}`);
  }, [id, navigate]);

  return (
    <>
    </>
  );
}

export default ProductOptionsPage
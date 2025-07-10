import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Category = () => {
  const [category, setCategory] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/category", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <div className="px-5 d-flex flex-column  mt-3 justify-content-center align-items-center">
      <div className="d-flex justify-content-center">
        <h3>Category List</h3>
      </div>
      <Link to="/dashboard/add_category" className="btn btn-success">
        Add Category
      </Link>
      <div className="mt-3 "style={{ maxWidth: "800px", margin: "0 auto",width: "100%" }}>
        <div className="table-responsive">
          <table
            className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden "
            
          >
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {category.map((c) => (
                <tr>
                  <td>{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category;

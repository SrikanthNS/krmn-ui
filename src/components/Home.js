import React from "react";
// import UserService from "../services/user.service";

const Home = () => {
  // const [content, setContent] = useState("");

  // useEffect(() => {
  //     UserService.getPublicContent().then(
  //         (response) => {
  //             setContent(response.data);
  //         },
  //         (error) => {
  //             const _content =
  //                 (error.response && error.response.data) ||
  //                 error.message ||
  //                 error.toString();

  //             setContent(_content);
  //         }
  //     );
  // }, []);

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Thought for the Day!</h5>
            <p className="card-text">
              Failures are the stepping stones for{" "}
              <span style={{ color: "green" }}>success</span>
            </p>
            <button href="#" className="btn btn-primary">
              Have a nice day
            </button>
          </div>
        </div>
      </div>
      <div className="col-sm-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Action Items for December</h5>
            <p className="card-text">
              With supporting text below as a natural lead-in to additional
              content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

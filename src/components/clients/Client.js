import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ClientService from "../../services/client.service";
import { deleteClient, updateClient } from "../../slices/clients";

const Client = (props) => {
    const initialClientState = {
        id: null,
        name: "",

    };
    const [currentClient, setCurrentClient] = useState(initialClientState);
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();

    const getClient = id => {
        ClientService.get(id)
            .then(response => {
                setCurrentClient(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    };

    useEffect(() => {
        getClient(props.match.params.id);
    }, [props.match.params.id]);

    const handleInputChange = event => {
        const { name, value } = event.target;
        setCurrentClient({ ...currentClient, [name]: value });
    };

    const updateContent = () => {
        dispatch(updateClient({ id: currentClient.id, data: currentClient }))
            .unwrap()
            .then(response => {
                console.log(response);
                setMessage("The Client was updated successfully!");
            })
            .catch(e => {
                console.log(e);
            });
    };

    const removeClient = () => {
        props.history.push("/clientList");
        window.location.reload();
        // dispatch(deleteClient({ id: currentClient.id }))
        //     .unwrap()
        //     .then(() => {
        //         props.history.push("/clients");
        //     })
        //     .catch(e => {
        //         console.log(e);
        //     });
    };

    return (
        <div>
            {currentClient && (
                <div className="edit-form">
                    <h4>Client</h4>
                    <form>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={currentClient.name}
                                onChange={handleInputChange}
                            />
                        </div>
                    </form>

                    <button className="btn btn-md btn-primary mr-2" onClick={removeClient}>
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="btn btn-md mr-2 btn-success"
                        onClick={updateContent}
                    >
                        Update
                    </button>
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default Client;
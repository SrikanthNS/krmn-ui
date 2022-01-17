import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    deleteAllClients, deleteClient, findClientByName, retrieveClients
} from "../../slices/clients";

const ClientList = () => {
    const [searchName, setSearchName] = useState("");
    const clients = useSelector(state => state.client);
    const dispatch = useDispatch();

    const onChangeSearchName = e => {
        const searchName = e.target.value;
        setSearchName(searchName);
    };

    const onSearchSubmit = e => {
        if (e.code === 'Enter') {
            findByName();
        }
    };

    const initFetch = useCallback(() => {

        dispatch(retrieveClients());
    }, [dispatch])

    useEffect(() => {
        initFetch()
    }, [initFetch])

    const removeClient = (id) => {
        if (!window.confirm("Are you sure you want to delete the client ?")) {
            return
        }
        dispatch(deleteClient({ id }))
            .unwrap()
            .catch(e => {
                console.log(e);
            });
    };

    const removeAllClients = () => {
        if (!window.confirm("Are you sure you want to delete all clients ?")) {
            return
        }
        dispatch(deleteAllClients())
            .catch(e => {
                console.log(e);
            });
    };

    const findByName = () => {
        dispatch(findClientByName({ name: searchName }));
    };

    return (
        <div className=" row">
            <div className="col-md-12">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by description"
                        value={searchName}
                        onChange={onChangeSearchName}
                        onKeyPress={onSearchSubmit}
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={findByName}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
            {/* client list table start */}
            <div className="col-md-2 table-responsive-md"></div>
            <div className="col-md-8 table-responsive-md">
                <h4>Client List</h4>
                {clients &&
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">
                                    #
                                </th>
                                <th scope="col">
                                    Client
                                </th>
                                <th scope="col" colSpan="2">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody >
                            {clients.map((client, index) => {
                                return (
                                    <tr key={`client-row-${index}`} >
                                        <td>
                                            {index + 1}
                                        </td>
                                        <td>
                                            {client.name}
                                        </td>

                                        <td colSpan="2">
                                            <div style={{ display: 'inline-flex' }}>
                                                <Link
                                                    to={"/clients/" + client.id}
                                                    className="btn btn-sm btn-warning mr-2 mt-0"
                                                >
                                                    Edit
                                                </Link>
                                                <button className="btn btn-sm btn-danger mr-2 mt-0" onClick={() => removeClient(client.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                }



            </div>
            <div className="col-md-2 table-responsive-md"></div>
            {/* client list table end */}
            <div className="col-md-10">


                {
                    clients.length === 0 ?

                        <div className="d-flex justify-content-center">
                            <h5 className="text-center text-info">
                                No Records Found
                            </h5>
                        </div>
                        :
                        <div className="d-flex justify-content-end">
                            <button
                                className="m-3 btn btn-sm btn-danger"
                                onClick={removeAllClients}
                            >
                                Remove All
                            </button>
                        </div>

                }
            </div>
        </div >
    );
};

export default ClientList;
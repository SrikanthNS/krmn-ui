import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createClient } from "../../slices/clients";
// import AddIcon from '@mui/icons-material/Add';
import { ClientForm } from "./ClientForm";

const AddClient = () => {
    const [submitted, setSubmitted] = useState(false);
    const [clientList, setClientList] = useState([]);
    const dispatch = useDispatch();

    const saveClient = (client) => {
        const { name } = client;
        dispatch(createClient({ name }))
            .unwrap()
            .then(() => {
                setClientList([]);
                setSubmitted(true);
            })
            .catch(e => {
                console.log("🚀 ~ file: AddClient.js ~ line 34 ~ saveClient ~ e", e.message)
            });
    };

    const initFetch = useCallback(async () => {
        setClientList([<ClientForm key="client-1" saveClient={saveClient} />]);
    }, [dispatch])

    useEffect(() => {
        initFetch();
    }, [initFetch])


    const newClient = () => {
        setClientList([...clientList, <ClientForm key="client-1" saveClient={saveClient} />]);
        setSubmitted(false);
    };



    return (
        <div className="col-md-12 table-responsive-md">
            <h4>Add New Client</h4>
            <hr></hr>
            <div className="submit-form" >
                {submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <button className="btn btn-success" onClick={() => newClient()}>
                            Add
                        </button>
                    </div>
                ) :
                    (<div className="row">
                        {/* <div >
                        <button className="btn btn-success" onClick={newClient}>
                            Add <AddIcon />
                        </button>
                    </div> */}
                        <div className="col-md-12" style={{ display: 'flex', flexDirection: 'column' }} >
                            {clientList.map(eachClient => eachClient)}
                        </div>
                    </div >)
                }

            </div >
        </div>
    );
};

export default AddClient;
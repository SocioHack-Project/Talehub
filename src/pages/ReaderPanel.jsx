import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, get } from "../firebase";
import {database} from "../firebase";

const ReaderPanel = () => {
    const [book, setBook] = useState({});
    const { storyId } = useParams();
    const [bookDetails, setBookDetails] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("storyId:: ", storyId);
        if (storyId) {
            setLoading(true);
            const bookRef = ref(database, 'stories/' + storyId);
            get(bookRef).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log("snap:::", snapshot.val());
                    setBook(snapshot.val());
                    setLoading(false);
                    setBookDetails(snapshot.val());
                } else {
                    console.log("No data available");
                    setLoading(false);
                }
            }).catch((error) => {
                console.error(error);
                setLoading(false);
            });
        }
    }, [storyId]);

    if (loading) return <div>Loading........</div>

    console.log(bookDetails);
    return (
        <div className="pt-10 text-center">
            <h1 className="text-3xl font-semibold capitalize">Reader Panel</h1>
            {bookDetails?.content && (
                <div>
                    <h1 className="text-3xl font-semibold capitalize">
                        {bookDetails?.title}
                    </h1>
                    <div className="flex justify-center">
                        {/* <img src={bookDetails?.photoURL} alt="Book Cover" style={{ height: '400px' }} /> */}
                    </div>
                    <div>
                        <p className="text-left py-5">{bookDetails?.content}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReaderPanel;
import axios from "axios";
import React from 'react';


const Pagination = ({ items, pageSize, onPageChange }) => {
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <button key={page} onClick={onPageChange} className="btn btn-primary page-item">
        {page}
      </button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// logic that gets data from Dog API
function GetDogs() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://dog.ceo/api/breeds/list/all",
    {
      breeds: []
    }
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [hasPics, setHasPics] = useState(false);
  const [pics, setPics] = useState([]);
  const options = [{value: '', text: '--Choose a dog--'}];

  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = [];
  if (pics.length > 0) {
    page = pics;
    if (page.length >= 1) {
      page = paginate(page, currentPage, pageSize);
      console.log(`currentPage: ${currentPage}`);
    }
  }

  const handleChange = event => {
    //make call to fetch picture of dog
    axios.get(`https://dog.ceo/api/breed/${event.target.value}/images`)
     .then(response => {
       const tmpPics = response.data.message;
       setPics(tmpPics);
       setHasPics(true);
     }, error => {
          console.log(error);
    });
  };
  
  if (data.message) {
    data.dogs = Object.keys(data.message);
    data.dogs.forEach(dog => {
      options.push({value: dog, text: dog});
    });
  } else {
    data.dogs = [];
  }

  return (
    <Fragment>
      <h2>Choose your favorite dog!</h2>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div>
          <select onChange={handleChange} className="dogSelect">
            {options.map((option,index) => (
              <option key={index} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {hasPics ? (
        <div>
          {page.map((item,index) => (
            <img key={index} src={item} alt="dog image" width="200" height="300"></img>
          ))}
        </div>
      ) : null
      }
      <Pagination
        items={pics}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

export default GetDogs;

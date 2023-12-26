import React, { useState, useEffect, useRef } from "react";
import { Grid, Card, CardMedia,Typography,CardActionArea,CardContent, CircularProgress } from "@mui/material";
import debounce from "lodash/debounce";
import "./styles.css";

const Listing = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const page = useRef(1);
  const screenHeight = window.innerHeight;
  const [pageLimit, setPageLimit] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState(false);
  const containerRef = useRef(null);
  const debouncedScroll = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [noDataFound, setNoDataFound] = useState(false);
  
  const handleScroll = () => {
    const container = containerRef.current;

    if (
      container &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 200
    ) {
      loadImages(false);
    }
  };

  useEffect(() => {
    loadImages(true);

    addScrollListener();
    return () => removeScrollListener();
  }, []);

  useEffect(() => {
    debouncedScroll.current = debounce(handleScroll, 100);
  }, []);

  const addScrollListener = () => {
    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", debouncedScroll.current);
    }
  };

  const removeScrollListener = () => {
    if (containerRef.current) {
      containerRef.current.removeEventListener("scroll", debouncedScroll.current);
    }
  };

  const loadImages = async (mount) => {
    const response = await fetch(
      `https://api.slingacademy.com/v1/sample-data/photos?offset=${page.current}&limit=10`
    );

    if (mount) {
      setLoading(true);

      const newImages = await response.json();
      console.log(newImages);
      const totalPages = Math.ceil(newImages?.total_photos / 10);
      setPageLimit(totalPages);

      setImages((prevImages) => [...prevImages, ...newImages.photos]);

      page.current += 1;
      setLoading(false);
    } else {
      setLoading(true);

      const newImages = await response.json();
      const totalPages = Math.ceil(newImages?.total_photos / 10);
      setPageLimit(totalPages);

      if (page.current <= totalPages) {
        setImages((prevImages) => [...prevImages, ...newImages.photos]);

        page.current += 1;
        setLoading(false);
      } else {
        setLoading(false);
        setNoDataMessage(true);
      }
    }
  };

  const handleSearch = async (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    const response = await fetch(
        `https://api.slingacademy.com/v1/sample-data/photos?offset=1&limit=10`
      );
    const imagesList = await response.json();
    const filtered = imagesList.photos.filter((item) => item.description.toLowerCase().includes(text) || item.title.toLowerCase().includes(text));
    if(!filtered.length) {
        setNoDataFound(true);
    }
    setImages([...filtered]);
  };

  return (
    <>
    <input
  type="text"
  placeholder="Search"
  value={searchText}
  onChange={handleSearch}
  className="search-input"
/>
    <div
      ref={containerRef}
      style={{ height: screenHeight + "px", overflowY: "auto" }}
    >
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={12} lg={3} md={4} xl={2} key={index}>
            <Card
              sx={{ minHeight: "350px", maxHeight: "500px", height: "100%" }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="auto"
                  image={image.url}
                  alt={image.title}
                />
                <CardContent>
                  <div style={{ maxHeight: "120px", overflow: "hidden" }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "pre-line",
                        display: "-webkit-box",
                        "-webkit-line-clamp": 2,
                        "-webkit-box-orient": "vertical"
                      }}
                    >
                      {image.title}
                    </Typography>
                  </div>
                  <div
                    style={{
                      maxHeight: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "20px"
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "pre-line",
                        display: "-webkit-box",
                        "-webkit-line-clamp": 4,
                        "-webkit-box-orient": "vertical"
                      }}
                    >
                      {image.description}
                    </Typography>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <CircularProgress />}
      {noDataMessage && <p>No More Data</p>}
      {noDataFound && <p>No Data found</p>}
    </div>
    </>
  );
};

export default Listing;
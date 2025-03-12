import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "DevOps Engineer",
    "Data Scientist",
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Graphic Designer",
    "FullStack Developer",
    "AI Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Marketing Specialist",
    "Cloud Architect",
    "Blockchain Developer",
    "Cybersecurity Specialist",
    "Business Analyst"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));  // Set the search query in Redux
        navigate("/browse");  // Navigate to the browse page
    };

    return (
        <div className="overflow-hidden">
            <Carousel className="w-full max-w-xl mx-auto my-20" loop={true} autoPlay={true} interval={3000}>
                <CarouselContent className="flex gap-8">
                    {category.map((cat, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 flex-shrink-0">
                            <Button onClick={() => searchJobHandler(cat)} variant="outline" className="rounded-full">
                                {cat}
                            </Button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
};

export default CategoryCarousel;

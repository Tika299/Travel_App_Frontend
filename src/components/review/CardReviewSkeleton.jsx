import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CardReviewSkeleton = () => {
  return (
    <div className="mt-7 max-w-7xl xl:mx-auto lg:mx-10 md:mx-10 sm:mx-5">
      <div className="my-10 shadow-lg border p-4 rounded-xl">
        {/* Avatar + User Info */}
        <div className="flex items-start">
          <Skeleton circle width={56} height={56} />
          <div className="w-full ml-5">
            <Skeleton height={20} width="40%" />
            <Skeleton height={14} width="60%" className="mt-2" />
          </div>
          <Skeleton width={24} height={24} />
        </div>

        {/* Content Post */}
        <div className="mt-4">
          <Skeleton count={3} height={12} />
        </div>

        {/* Image Post */}
        <div className="mt-4 w-full h-[460px]">
          <Skeleton height={460} />
        </div>

        {/* Stats (Like, Comment, Share) */}
        <div className="my-4 flex space-x-6 ml-4">
          <Skeleton width={60} height={20} />
          <Skeleton width={60} height={20} />
          <Skeleton width={60} height={20} />
        </div>

        {/* Comment input */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-4">
            <Skeleton circle width={48} height={48} />
            <Skeleton height={40} width="100%" borderRadius="999px" />
            <Skeleton width={24} height={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardReviewSkeleton;

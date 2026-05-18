export default function TestImagePage() {
    return (
        <div className="p-10 space-y-8">
            <h1>Image Debugging Page</h1>

            <div className="border p-4">
                <h2>Standard img tag:</h2>
                <img src="/images/s/s1.jpg" alt="Standard IMG Test" width="300" />
            </div>

            <div className="border p-4">
                <h2>Standard img tag (s2):</h2>
                <img src="/images/s/s2.jpg" alt="Standard IMG Test 2" width="300" />
            </div>
        </div>
    )
}

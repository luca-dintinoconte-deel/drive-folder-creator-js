const express = require('express');
const { createOrgStructure } = require('./driveUtils');

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    const targetDriveId = process.env.GOOGLE_SHARED_DRIVE_ID;
    if (!targetDriveId) {
        return res.status(500).json({ error: 'GOOGLE_SHARED_DRIVE_ID environment variable is not set' });
    }

    const { organizationName } = req.body;
    if (!organizationName) {
        return res.status(400).json({ error: "Missing 'organizationName' in payload" });
    }

    try {
        const result = await createOrgStructure(organizationName, targetDriveId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

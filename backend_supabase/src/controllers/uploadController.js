const supabase = require("../config/supabaseClient");
const XLSX = require("xlsx");

async function uploadDataset(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer;

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const rows = jsonData.slice(6);
    console.log(`Total rows in Excel after header skip: ${rows.length}`);

    const studentsToInsert = [];
    let skippedRows = 0;

    rows.forEach((row, index) => {
      // Check if row has registration number (more flexible check)
      const regNo = row[1] ? String(row[1]).trim() : '';
      
      if (!regNo || regNo === '' || regNo === 'undefined') {
        skippedRows++;
        console.log(`Skipping row ${index + 7}: No registration number`);
        return;
      }

      const name = row[2] ? String(row[2]).trim() : 'Unknown';

      const s1 = row[5] || 0;  // MA23111
      const s2 = row[8] || 0;  // AL23311
      const s3 = row[11] || 0; // CS23411
      const s4 = row[14] || 0; // CS23312
      const s5 = row[17] || 0; // EC23331

      studentsToInsert.push({
        reg_no: regNo,
        name: name,
        semester: Number(req.body.semester),
        data: {
          MA23111: s1,
          AL23311: s2,
          CS23411: s3,
          CS23312: s4,
          EC23331: s5
        }
      });
    });

    console.log(`Processed ${studentsToInsert.length} students, skipped ${skippedRows} rows`);

    // First create dataset entry
    const { data: datasetData, error: datasetError } = await supabase
      .from("datasets")
      .insert({
        name: `Semester ${req.body.semester} - ${req.file.originalname}`,
        uploaded_by: "Teacher",
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (datasetError) {
      console.log("DATASET INSERT ERROR =>", datasetError);
      return res.status(500).json({ error: "Failed creating dataset entry" });
    }

    // Delete existing students for this semester
    await supabase.from("students").delete().eq("semester", req.body.semester);

    // Add dataset_id to each student record
    const studentsWithDatasetId = studentsToInsert.map(student => ({
      ...student,
      dataset_id: datasetData.id
    }));

    const { error } = await supabase
      .from("students")
      .insert(studentsWithDatasetId);

    if (error) {
      console.log("SUPABASE INSERT ERROR =>", error);
      return res.status(500).json({ error: "Failed inserting rows" });
    }

    return res.json({ 
      message: "Dataset uploaded successfully", 
      studentsProcessed: studentsToInsert.length,
      rowsSkipped: skippedRows,
      datasetId: datasetData.id
    });

  } catch (err) {
    console.error("UPLOAD ERROR =>", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}

module.exports = { uploadDataset };

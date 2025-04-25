'use strict';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Define Issue schema
const IssueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: { type: String, required: true }
});

module.exports = function (app) {
  // Connect to MongoDB when the app starts
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // Create Issue model
  const Issue = mongoose.model('Issue', IssueSchema);

  app.route('/api/issues/:project')
    .get(function (req, res) {
      let project = req.params.project;
      
      // Create filter object with project
      let filter = { project: project };
      
      // Add any query parameters to the filter
      Object.keys(req.query).forEach(key => {
        if (key !== 'project') {
          filter[key] = req.query[key];
        }
      });
      
      // Find issues that match the filter
      Issue.find(filter)
        .then(issues => {
          res.json(issues);
        })
        .catch(err => {
          res.status(500).json({ error: 'Could not retrieve issues', details: err.message });
        });
    })
    
    .post(function (req, res) {
      let project = req.params.project;
      
      // Check if required fields are provided
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      // Create new issue object
      const newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        project: project
      });
      
      // Save the issue to the database
      newIssue.save()
        .then(savedIssue => {
          res.json(savedIssue);
        })
        .catch(err => {
          res.json({ error: 'could not save issue', details: err.message });
        });
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      
      // Check if _id is provided
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Check if there are fields to update
      const updateFields = {};
      const possibleFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      
      let hasUpdates = false;
      possibleFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields[field] = req.body[field];
          hasUpdates = true;
        }
      });
      
      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', _id: req.body._id });
      }
      
      // Add updated_on timestamp
      updateFields.updated_on = new Date();
      
      // Validate ObjectId format
      let _id;
      try {
        _id = new ObjectId(req.body._id);
      } catch (err) {
        return res.json({ error: 'could not update', _id: req.body._id });
      }
      
      // Update the issue
      Issue.findOneAndUpdate(
        { _id: _id, project: project },
        { $set: updateFields },
        { new: true }
      )
        .then(updatedIssue => {
          if (!updatedIssue) {
            return res.json({ error: 'could not update', _id: req.body._id });
          }
          res.json({ result: 'successfully updated', _id: req.body._id });
        })
        .catch(err => {
          res.json({ error: 'could not update', _id: req.body._id });
        });
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      
      // Check if _id is provided
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Validate ObjectId format
      let _id;
      try {
        _id = new ObjectId(req.body._id);
      } catch (err) {
        return res.json({ error: 'could not delete', _id: req.body._id });
      }
      
      // Delete the issue
      Issue.findOneAndDelete({ _id: _id, project: project })
        .then(deletedIssue => {
          if (!deletedIssue) {
            return res.json({ error: 'could not delete', _id: req.body._id });
          }
          res.json({ result: 'successfully deleted', _id: req.body._id });
        })
        .catch(err => {
          res.json({ error: 'could not delete', _id: req.body._id });
        });
    });
};
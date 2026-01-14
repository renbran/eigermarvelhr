/**
 * Candidate Portal
 * Complete job hunting and application tracking portal for candidates
 */

import React, { useEffect, useState } from 'react';
import { useOdooJobs, useJobApplication, useJobApplications } from '@/hooks/useOdooSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobListing, JobApplication } from '@/lib/odoo-models';

export function CandidatePortal() {
  const { jobs, loading: jobsLoading } = useOdooJobs();
  const { applications, loading: appsLoading } = useJobApplications();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Career Portal</h1>
          <p className="mt-2 text-lg text-gray-600">Find your next opportunity at Eiger Marvel</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">
              My Applications {applications.length > 0 && <Badge className="ml-2">{applications.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Available Positions</h2>
              <p className="text-gray-600">Explore all open positions and apply today</p>
            </div>

            {jobsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobBrowseCard
                    key={job.odooId}
                    job={job}
                    onSelect={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            )}

            {/* Job Detail Modal */}
            {selectedJob && (
              <JobDetailModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
              />
            )}
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Application Status</h2>
              <p className="text-gray-600">Track the status of your applications</p>
            </div>

            {appsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard key={app.odooId} application={app} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">No applications yet. Browse jobs and apply to get started!</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab('browse')}
                  >
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Save jobs to apply later</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface JobBrowseCardProps {
  job: JobListing;
  onSelect: () => void;
}

function JobBrowseCard({ job, onSelect }: JobBrowseCardProps) {
  const openPositions = job.position - job.filled;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={onSelect}>
      <CardHeader>
        <CardTitle className="line-clamp-2">{job.title}</CardTitle>
        <CardDescription>{job.department}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-gray-600">{job.description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {openPositions} Open Position{openPositions !== 1 ? 's' : ''}
          </Badge>
          <span className="text-sm text-gray-500">{job.createdAt && new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

interface JobDetailModalProps {
  job: JobListing;
  onClose: () => void;
}

function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const { submit, submitting, error, success } = useJobApplication();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit({
        candidateName: formData.name,
        candidateEmail: formData.email,
        candidatePhone: formData.phone,
        jobId: job.odooId,
        message: formData.message,
      });
      
      if (success) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.department}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">About This Position</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Open Positions</p>
              <p className="text-lg font-semibold">{job.position - job.filled}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Posted</p>
              <p className="text-lg font-semibold">{job.createdAt && new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Application Form */}
          <div className="border-t pt-6">
            <h3 className="mb-4 font-semibold">Apply Now</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Why are you interested in this role?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
              />

              {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">Application submitted successfully!</div>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ApplicationCardProps {
  application: JobApplication;
}

function ApplicationCard({ application }: ApplicationCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    screening: 'bg-yellow-100 text-yellow-800',
    interview: 'bg-purple-100 text-purple-800',
    offered: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-200 text-green-900',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Job ID: {application.jobId}</p>
            <p className="text-sm text-gray-600">Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
            {application.notes && <p className="text-sm text-gray-600 mt-2">{application.notes}</p>}
          </div>
          <Badge className={statusColors[application.status]}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

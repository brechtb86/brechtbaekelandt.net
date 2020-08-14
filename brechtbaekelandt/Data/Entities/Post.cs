﻿using System;
using System.Collections.Generic;

namespace brechtbaekelandt.Data.Entities
{
    public class Post : BaseEntity
    {
        public DateTime Created { get; set; }

        public DateTime? LastModified { get; set; }

        public bool IsPostVisible { get; set; }

        public bool IsPostPinned { get; set; }

        public string Title { get; set; }

        public string InternalTitle { get; set; }

        public string Description { get; set; }

        public string Content { get; set; }

        public virtual User User { get; set; }

        public string PictureUrl { get; set; }

        public string Tags { get; set; }

        public virtual ICollection<PostCategory> PostCategories { get; set; }

        public virtual ICollection<Attachment> Attachments { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }

        public int Likes { get; set; }

        public bool SubscriberEmailSent { get; set; }      
    }
}
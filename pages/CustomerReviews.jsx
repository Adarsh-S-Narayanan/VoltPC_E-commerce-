import React, { useEffect, useState } from 'react';
import * as api from '../services/apiService';
import $ from 'jquery';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reviews.length === 0) return;

    // Initial animation for cards using jQuery
    $('.review-card').css({ opacity: 0, transform: 'translateY(20px)' });
    
    $('.review-card').each(function(index) {
        $(this).delay(100 * index).animate({
            opacity: 1,
            top: 0
        }, {
            step: function(now, fx) {
                if (fx.prop === 'opacity') {
                    $(this).css('transform', `translateY(${20 * (1 - now)}px)`);
                }
            },
            duration: 800
        });
    });

    // Filter logic using jQuery
    $('.filter-btn').off('click').on('click', function() {
      const rating = $(this).attr('data-rating');
      
      // Update buttons
      $('.filter-btn').removeClass('bg-primary text-white shadow-glow').addClass('bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300');
      $(this).removeClass('bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300').addClass('bg-primary text-white shadow-glow');

      if (rating === 'all') {
        $('.review-card').fadeIn(400);
      } else {
        $('.review-card').hide();
        $(`.review-card[data-rating="${rating}"]`).fadeIn(400);
      }
    });

    // Hover effect using jQuery
    $('.review-card').off('mouseenter mouseleave').on('mouseenter', function() {
        $(this).find('.avatar-img').css('transform', 'scale(1.1) rotate(5deg)');
    }).on('mouseleave', function() {
        $(this).find('.avatar-img').css('transform', 'scale(1) rotate(0deg)');
    });

    // Star Rating Logic
    $('.star-btn').off('mouseenter mouseleave click').on('mouseenter', function() {
      const val = $(this).data('value');
      $('.star-btn').each(function() {
        if ($(this).data('value') <= val) {
          $(this).addClass('text-yellow-400').removeClass('text-gray-300 dark:text-gray-700');
        } else {
          $(this).removeClass('text-yellow-400').addClass('text-gray-300 dark:text-gray-700');
        }
      });
    }).on('mouseleave', function() {
      const currentRating = $('#rating-input').val();
      $('.star-btn').each(function() {
        if (currentRating && $(this).data('value') <= currentRating) {
          $(this).addClass('text-yellow-400').removeClass('text-gray-300 dark:text-gray-700');
        } else {
          $(this).removeClass('text-yellow-400').addClass('text-gray-300 dark:text-gray-700');
        }
      });
    }).on('click', function() {
      const val = $(this).data('value');
      $('#rating-input').val(val);
      $('.star-btn').each(function() {
        if ($(this).data('value') <= val) {
          $(this).addClass('text-yellow-400').removeClass('text-gray-300 dark:text-gray-700');
        } else {
          $(this).removeClass('text-yellow-400').addClass('text-gray-300 dark:text-gray-700');
        }
      });
    });

    // Form Submission Logic
    $('#review-form').off('submit').on('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const reviewData = {
        name: formData.get('name'),
        rating: parseInt(formData.get('rating')),
        title: formData.get('title'),
        content: formData.get('content'),
        purchase: formData.get('purchase'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '4-digit' }).toUpperCase(),
        avatar: `https://ui-avatars.com/api/?name=${formData.get('name')}&background=random`
      };

      const submitBtn = $(this).find('button[type="submit"]');
      const originalText = submitBtn.text();
      
      // Animation for transmission
      submitBtn.prop('disabled', true).text('TRANSMITTING...');
      
      try {
        await api.createReview(reviewData);
        $('#success-overlay').fadeIn(400);
        submitBtn.prop('disabled', false).text(originalText);
        loadReviews(); // Reload to show new review
      } catch (err) {
        alert("Submission failed.");
        submitBtn.prop('disabled', false).text(originalText);
      }
    });

    // Reset Form
    $('#reset-form').off('click').on('click', function() {
      $('#success-overlay').fadeOut(400);
      $('#review-form')[0].reset();
      $('#rating-input').val('');
      $('.star-btn').removeClass('text-yellow-400').addClass('text-gray-300 dark:text-gray-700');
    });

    return () => {
      $('.filter-btn').off('click');
      $('.review-card').off('mouseenter mouseleave');
      $('.star-btn').off('mouseenter mouseleave click');
      $('#review-form').off('submit');
      $('#reset-form').off('click');
    };
  }, [reviews]);

  return (
    <div className="pt-32 pb-20 px-6 max-w-[1440px] mx-auto min-h-screen">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Verified Performance Testimonials
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter leading-none transition-colors">
          THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">PULSE</span> OF PERFECTION
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-xl font-light transition-colors">
          Real data from real engineers. Discover why the world's most demanding builders choose VoltPC for their critical missions.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-16 flex-wrap animate-in fade-in duration-1000 delay-300">
        <button data-rating="all" className="filter-btn px-8 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all hover:-translate-y-1">All Reports</button>
        {[5, 4, 3, 2, 1].map(r => (
          <button key={r} data-rating={r} className="filter-btn px-8 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest text-xs transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:-translate-y-1">
            {r} STARS
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center gap-6">
          <div className="size-16 border-t-2 border-primary rounded-full animate-spin"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Querying Testimonials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="reviews-container">
          {reviews.map(review => (
            <div 
              key={review._id || review.id} 
              data-rating={review.rating} 
              className="review-card relative bg-white dark:bg-[#0f0f0f] border border-black/5 dark:border-white/5 p-10 rounded-3xl overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="avatar-img w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 transition-transform duration-500" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-lg">
                      <span className="material-symbols-outlined text-[10px] block">verified</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg transition-colors">{review.name}</h4>
                    <div className="flex text-primary gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill-1' : 'opacity-20'}`}>star</span>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase leading-tight tracking-tighter transition-colors">
                  "{review.title}"
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 font-medium italic opacity-80 group-hover:opacity-100 transition-opacity transition-colors">
                  {review.content}
                </p>

                <div className="flex flex-col gap-4 pt-8 border-t border-black/5 dark:border-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Equipment</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-primary transition-colors">{review.purchase}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Deploy Date</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-32 grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Intelligence Gathering
          </div>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none transition-colors">
            SUBMIT YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">PERFORMANCE REPORT</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light leading-relaxed max-w-md transition-colors">
            Your data helps us optimize future generations. Share your engineering experience with the community.
          </p>
          
          <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">System Uptime</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white transition-colors">99.98% Confidence</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/5 dark:border-white/5 p-10 rounded-[40px] shadow-2xl transition-colors">
          <form id="review-form" className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Satisfaction Level</label>
              <div id="star-rating" className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map(i => (
                  <button 
                    key={i} 
                    type="button" 
                    data-value={i} 
                    className="star-btn material-symbols-outlined cursor-pointer transition-all hover:scale-110 text-gray-300 dark:text-gray-700"
                  >
                    star
                  </button>
                ))}
              </div>
              <input type="hidden" name="rating" id="rating-input" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Operator Name</label>
                <input 
                  type="text" 
                  name="name" 
                  autoComplete="off"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-gray-400 dark:text-white"
                  placeholder="e.g. Alex Chen"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Deployed Rig</label>
                <select 
                  name="purchase" 
                  className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none cursor-pointer dark:text-white"
                  required
                >
                  <option value="">Select Configuration</option>
                  <option value="Velocity V4">Velocity V4</option>
                  <option value="Architect Pro">Architect Pro</option>
                  <option value="Nexus Core">Nexus Core</option>
                  <option value="Custom Build">Custom Build</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Report Headline</label>
              <input 
                type="text" 
                name="title" 
                autoComplete="off"
                className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-gray-400 dark:text-white"
                placeholder="Brief summary of your experience"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Performance Logs</label>
              <textarea 
                name="content" 
                rows="4" 
                className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-gray-400 dark:text-white resize-none"
                placeholder="Detailed feedback and benchmark results..."
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-primary hover:bg-[#6a19b0] text-white font-black uppercase tracking-widest rounded-xl shadow-glow transition-all transform hover:-translate-y-1 active:scale-[0.98]"
            >
              TRANSMIT REPORT
            </button>
          </form>

          {/* Success Overlay via jQuery */}
          <div id="success-overlay" className="hidden absolute inset-0 bg-white/95 dark:bg-[#0f0f0f]/95 rounded-[40px] flex flex-col items-center justify-center text-center p-10 z-50 transition-colors">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 transition-colors">Transmission Successful</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Your performance data has been added to our central database.</p>
            <button id="reset-form" className="mt-8 text-primary text-xs font-black uppercase tracking-widest hover:underline">New Submission</button>
          </div>
        </div>
      </div>
      
      <div className="mt-32 text-center p-16 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 animate-in fade-in duration-1000 delay-500">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter transition-colors">READY TO ENGINEER YOURS?</h2>
        <button className="px-12 py-6 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow hover:shadow-glow-hover transition-all transform hover:-translate-y-1">
          START CONFIGURATION
        </button>
      </div>
    </div>
  );
};

export default CustomerReviews;

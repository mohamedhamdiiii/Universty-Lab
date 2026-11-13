import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/dashboard" class="btn-primary">Go to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .not-found-content {
      text-align: center;
      color: white;
    }
    .not-found-content h1 {
      font-size: 8rem;
      margin: 0;
      font-weight: 800;
      line-height: 1;
      opacity: 0.9;
    }
    .not-found-content h2 {
      font-size: 1.8rem;
      margin: 0.5rem 0 1rem;
      font-weight: 600;
    }
    .not-found-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.85;
    }
    .btn-primary {
      display: inline-block;
      padding: 0.8rem 2rem;
      background: white;
      color: #667eea;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  `]
})
export class NotFoundComponent {}

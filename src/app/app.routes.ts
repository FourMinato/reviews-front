import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SearchComponent } from './pages/search/search.component';
import { CreateComponent } from './admin/create/create.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UpdateComponent } from './admin/update/update.component';
import { DetailsComponent } from './admin/details/details.component';
import { UserComponent } from './admin/user/user.component';
import { DetailComponent } from './admin/user/detail/detail.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { ReviewComponent } from './pages/create/review/review.component';
import { QuestionComponent } from './pages/create/question/question.component';
import { OtherComponent } from './users/profile/other/other.component';
import { SelfComponent } from './users/profile/self/self.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ReviewAllPostsComponent } from './pages/post/review/review.component';
import { QuestionAllPostsComponent } from './pages/post/question/question.component';
import { PostdetailsComponent } from './pages/post/question/postdetails/postdetails.component';
import { ReviewdetailsComponent } from './pages/post/review/reviewdetails/reviewdetails.component';
import { EditReviewComponent } from './pages/edit/edit-review/edit-review.component';
import { FavoriteComponent } from './pages/favorite/favorite.component';
import { MessageComponent } from './pages/message/message.component';
import { EditQuestionComponent } from './pages/edit/edit-question/edit-question.component';
import { WatchDetailsComponent } from './admin/watch-details/watch-details.component';
export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'login', component: LoginComponent },
    { path: 'subjects', component: SubjectsComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'search', component: SearchComponent },
    { path: 'contact', component: ContactComponent },

    { path: 'admin/dashboard', component: DashboardComponent },
    { path: 'admin/create', component: CreateComponent },
    { path: 'admin/edit', component: UpdateComponent },
    { path: 'admin/details', component: DetailsComponent },
    { path: 'admin/reports', component: ReportsComponent },
    { path: 'admin/users', component: UserComponent },
    { path: 'admin/user/detail', component: DetailComponent },
    { path: 'admin/watch/detail', component: WatchDetailsComponent },

    { path: 'create/review', component: ReviewComponent },
    { path: 'create/question', component: QuestionComponent },

    { path: 'post/question/details', component: PostdetailsComponent },
    { path: 'post/review/details', component: ReviewdetailsComponent },

    { path: 'profile/others', component: OtherComponent },
    { path: 'profile', component: SelfComponent },

    { path: 'post/review', component: ReviewAllPostsComponent },
    { path: 'post/question', component: QuestionAllPostsComponent },

    { path: 'edit/review', component: EditReviewComponent },
    { path: 'edit/question', component: EditQuestionComponent },

    { path: 'favorite', component: FavoriteComponent },
    { path: 'message', component: MessageComponent },
];